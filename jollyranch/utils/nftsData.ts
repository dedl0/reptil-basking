/* eslint-disable @typescript-eslint/no-explicit-any */
import { Program } from "@project-serum/anchor";
import { getMetaplexToken } from './token';
import * as anchor from "@project-serum/anchor";
import { chunks } from "./common";
import { AccountInfo, ConfirmOptions, Connection } from "@solana/web3.js";
import axios from "axios";
import { programs } from "@metaplex/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {NftStaker} from "../lib/types/nft_staker";
import {AnchorWallet} from "@solana/wallet-adapter-react";


export default class NftsData {
    wallet: AnchorWallet;
    program: Program;
    connection: Connection;
    rpcEndpoint: string;
    hashTable: string[];
    hashTableLegendaries: string[];
    redemptionRate: number;
    redemptionRateLegendary: number;
    
    constructor(
        wallet: AnchorWallet,
        program: Program,
        hashTable: string[],
        hashTableLegendaries: string[] = [],
        redemptionRate: number,
        redemptionRateLegendary: number,
        
    ) {
        this.wallet = wallet;
        this.program = program;
        this.rpcEndpoint = 'https://bold-fragrant-cloud.solana-mainnet.quiknode.pro/6c6aa8c19e1c474208e30db3fa3a74c4a12ffff9/'
        this.connection = new Connection(
            this.rpcEndpoint,
            "processed" as ConfirmOptions
        );
        this.hashTable = hashTable;
        this.hashTableLegendaries = hashTableLegendaries;
        this.redemptionRate = redemptionRate;
        this.redemptionRateLegendary = redemptionRateLegendary;
        
    }
    async getWalletUnStakedNfts() {
        // console.log("fetched mint hashes");
        const tokenAccounts = await this.program.provider.connection.getParsedTokenAccountsByOwner(
            this.wallet.publicKey,
            {
                programId: TOKEN_PROGRAM_ID,
            }
        );
            
        // console.log("got token accounts", tokenAccounts);
        const tokenAccountsMints = tokenAccounts.value.filter(tokenAccount => {
            const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
            return (tokenAmount.amount == "1" &&
                tokenAmount.decimals == "0" &&
                this.hashTable.includes(tokenAccount.account.data.parsed.info.mint));

        }).map(tokenAccount => tokenAccount.account.data.parsed.info.mint);

        return this.getNftsData(tokenAccountsMints);
    }

    async getWalletStakedNfts() {
        const newStakedNFTs = await this.program.account.stake.all([
            {
                memcmp: {
                    offset: 8, // Discriminator
                    // bytes: bs58.encode(wallet.publicKey.toBuffer()),
                    bytes: this.wallet.publicKey.toBase58(),
                },
            },
        ]);

        // console.log("newStakedNFTs", newStakedNFTs.map(item => ({publicKey: item.publicKey.toString(), withdrawn: item.account.withdrawn, id: item.id}) ));
        const stakedNfts = newStakedNFTs.filter(
            (stake) => stake.account.withdrawn === false);
        // console.log("----------stakedNfts",stakedNfts);
        const stake_spls = await Promise.all(stakedNfts.map(async (nft_account) => {
            const [stake_spl, _stakeBump] =
                await anchor.web3.PublicKey.findProgramAddress(
                    [nft_account.publicKey.toBuffer()],
                    this.program.programId
                );
            return stake_spl.toString();
        }));

        const mints = await Promise.all(
            chunks(stake_spls, 9).map(async _chunk =>
                await axios
                    .post(this.rpcEndpoint, {
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getMultipleAccounts",
                        params: [
                            _chunk,
                            {
                                encoding: "jsonParsed",
                            },
                        ],
                    })
                    .then(async (res) => {
                        if (res?.data?.result?.value?.length) {
                            // Filter nulls first (user wallet may not be updated) and then map
                            return res.data.result.value.filter((v: any) => v).map((v: any) => v.data.parsed.info.mint);
                        } else {
                            return [];
                        }
                    })
            ),
        ).then((res) => {
            return res.flat();
        });

        const nftsData = await this.getNftsData(mints);
        // append stakedNfts data before returning

        return nftsData.map(nftData => {
            const stakeAccount = stakedNfts.find(stakedNft => nftData.mint === stakedNft.account.mint.toString());
            let estimateRewards = 0;
            let isLocked = false;
            let lockMultiplier = null;
            let lockEndsIn = null;
            let redemptionRate = null;
            if (stakeAccount) {
                if (stakeAccount.account.endDate) {
                    // @ts-ignore
                    const lockEndUnix = stakeAccount.account.endDate * 1000;
                    // @ts-ignore
                    const lockStartUnix = stakeAccount.account.startDate * 1000;
                    const todayUnix = parseInt((new Date().getTime()).toFixed(0));
                    //const future = new Date();
                    //future.setDate(future.getDate() + 7);
                    //const futureUnix = parseInt((future.getTime()).toFixed(0));
                    if (lockEndUnix > todayUnix) {
                        isLocked = true;
                        const lockPeriodInDays = (lockEndUnix - lockStartUnix) / (1000 * 3600 * 24);
                        // lockMultiplier = this.lockMultipliers.find(multiplier => multiplier.days === lockPeriodInDays);
                        // const relativeTime = new RelativeTime({ locale: 'en' });
                        // @ts-ignore
                        lockEndsIn = relativeTime.from(new Date(stakeAccount.account.endDate * 1000))
                    }
                }
                
                redemptionRate = nftData.redemptionRate;
                if (redemptionRate) {
                    if (lockMultiplier) {
                        redemptionRate = redemptionRate * lockMultiplier.multiplier;
                    }
                    const currDate = new Date().getTime() / 1000;
                    const daysElapsed =
                        // @ts-ignore
                        Math.abs(currDate - stakeAccount.account.startDate) /
                        (60 * 60 * 24);
                    const amountRedeemed =
                        stakeAccount.account.amountRedeemed.toNumber() / 1e6;
                    estimateRewards = redemptionRate * daysElapsed - amountRedeemed;
                }
            }
            return {
                ...nftData,
                redemptionRate,
                stakeAccount,
                estimateRewards,
                isLocked,
                lockMultiplier,
                lockEndsIn,
            }
        });

    }
    async getTotalStakedNfts() {
        const stakes = await this.program.account.stake.all();
        return stakes.filter((stake: any) => stake.account.withdrawn === false).length;
    }
    private async getNftsData(mints: string[]) {
        const metaplexToken = getMetaplexToken();

        const pdas = await Promise.all(mints.map(async mint => {
            const tokenAccount = new anchor.web3.PublicKey(mint);
            const [pda] = await anchor.web3.PublicKey.findProgramAddress(
                [
                    Buffer.from("metadata"),
                    metaplexToken.toBuffer(),
                    new anchor.web3.PublicKey(tokenAccount.toString()).toBuffer(),
                ],
                metaplexToken
            );
            return pda;
        }));

        // console.log("mints", mints);
        // console.log("pdas", pdas.map(_p => _p.toString()));

        const accountInfoPdas = await Promise.all(
            chunks(pdas, 9).map(_chunk =>
                this.connection.getMultipleAccountsInfo(_chunk),
            ),
        ).then((res) => {
            return res.flat();
        });
        const metadatas = accountInfoPdas.map(accountInfoPda => {
            return new programs.metadata.Metadata(
                this.wallet.publicKey.toString(),
                accountInfoPda as AccountInfo<Buffer>
            );
        })

        // console.log("metadata", metadatas);

        return await Promise.all(metadatas.map(async metadata => {
            const uri = metadata.data.data.uri.replace("dweb.link", "infura-ipfs.io")
            const { data } = await axios.get(uri);
            let image = data?.image;
            if (image.includes('ipfs.dweb.link')) {
                // We need to transform https://xxx.ipfs.dweb.link to https://infura-ipfs.io/ipfs/xxx
                // nextjs does not allow whitelisting subdomains so we need to fetch images from 1 root domain
                const id = image.split('//').pop().split('.')[0];
                image = `https://infura-ipfs.io/ipfs/${id}?ext=jpg`;
            }
            const isLegendary = this.hashTableLegendaries.includes(metadata.data.mint);
            

            return {
                ...data,
                image,
                isLegendary,
                id: Number(data.name.replace(/^\D+/g, "").split(" - ")[0]),
                redemptionRate: isLegendary ? this.redemptionRateLegendary : this.redemptionRate,
                mint: metadata.data.mint,
            };
        })).then(res => {
            return res.sort(function (a: any, b: any) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        });
    }
}
