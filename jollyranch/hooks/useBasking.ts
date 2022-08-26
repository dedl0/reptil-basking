import create from "zustand";
import * as anchor from "@project-serum/anchor";
import {
    AccountInfo,
    ConfirmOptions,
    Connection, 
    ParsedAccountData,
    PublicKey,
} from "@solana/web3.js";
import {Program, Provider, Idl} from "@project-serum/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    // @ts-ignore
    getAssociatedTokenAddress,
    Token,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { AnchorWallet, useAnchorWallet, } from "@solana/wallet-adapter-react";
import NftsData from "../utils/nftsData";
import NftsTable from '../lib/lizardsTable.json'
import Liz from '../lib/lizardsTable.json'
import * as bs58 from 'bs58'
import {getTrtnToken} from "../utils/token";
import { NFT } from "../components/NFTLoader";
import {toast} from "react-toastify";
import IDL from '../lib/idl/basking_idl.json'

type reptileState = {
    wallet: AnchorWallet;
    program: Program;
    connection: Connection;
    jollyranch: PublicKey;
    baskingGroup: number;
    jollyBump: number;
    spl_token: PublicKey;
    recieverSplAccount: PublicKey;
    splBump: number;
    wallet_token_account: PublicKey;
    timerStart: number;
    startDate: number;
    endDate: number;
    lizardType: number;
}

type reptilStats = {
    unStakedNfts: NFT[],
    stakedNfts: NFT[],
    trtnBalance: number;
}

type stakedNft = {
    reptile: NFT,
    splBump: number,
    startDate: number,
    endDate: number,
    timerStart: number,
    baskingGroup: number,
    lizardType: number,
    withdrawn: boolean,
}

interface Basking {
    state: reptileState;
    stats: reptilStats;
    staked: stakedNft;
    initState: (wallet: AnchorWallet) => Promise<boolean>;
    getStats: () => Promise<boolean>;
}

const useBasking = create <Basking>((set, get)=>({
    state: {} as reptileState,
    stats: {} as reptilStats,
    staked: {} as stakedNft,
    initState: async (wallet: AnchorWallet) => {
        const connection = new Connection(
            'https://bold-fragrant-cloud.solana-mainnet.quiknode.pro/6c6aa8c19e1c474208e30db3fa3a74c4a12ffff9/',
            "processed" as ConfirmOptions
        );
        const provider = new Provider(connection, wallet, "processed" as ConfirmOptions);
        const program = new Program(IDL as Idl, process.env.NEXT_PUBLIC_EYE_PROGRAM as string, provider)
        const [jollyranch, jollyBump] =
            await PublicKey.findProgramAddress(
                [Buffer.from("jolly_account")],
                program.programId
            );
        const spl_token = getTrtnToken();
        const wallet_token_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            spl_token,
            wallet.publicKey
        );
        // const wallet_token_account = await findAssociatedTokenAddress(
        //     spl_token,
        //     wallet.publicKey
        // );

        const [recieverSplAccount, splBump] =
        await PublicKey.findProgramAddress(
          [jollyranch.toBuffer()],
          program.programId
        );

       const jollyData = await program.account.jollyRanch.fetch(jollyranch);
       const baskingGroup = jollyData.baskingGroup;
       const timerStart = jollyData.timerStart
       const startDate = jollyData.startDate
       const endDate = jollyData.endDate
       const lizardType = jollyData.lizardType

        set({
            state: {
                wallet,
                program,
                connection,
                jollyranch,
                jollyBump,
                spl_token,
                wallet_token_account,
                recieverSplAccount,
                splBump,
                baskingGroup,
                timerStart,
                startDate,
                endDate,
                lizardType,
            }
        })

        return true
    },
    getStats: async () => {
        const program = get().state.program;
        const wallet = get().state.wallet;
        const nfts = new NftsData(wallet, program, NftsTable, [], 0,0);
        const unStakedNfts = await nfts.getWalletUnStakedNfts();
        const stakedNfts = await nfts.getWalletStakedNfts();
        const trtnBalance = await getTrtnBalance(program);

        set({
            stats: {
                unStakedNfts,
                trtnBalance,
                stakedNfts            
            }
        })  
        return true
    },

}))


  
async function getTrtnBalance(program: Program){
    let trtnBalance = 0;
    const trtnToken = getTrtnToken();
    const tokenAccounts = await program.provider.connection.getParsedTokenAccountsByOwner(program.provider.wallet.publicKey, {programId: TOKEN_PROGRAM_ID});
    if(tokenAccounts?.value?.length) {
        tokenAccounts.value.forEach((tokenAccount: { pubkey:PublicKey , account:AccountInfo<ParsedAccountData>}) => {
            const uiAmount = tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
            switch(tokenAccount?.account?.data?.parsed?.info.mint) {
                case trtnToken.toString():
                    trtnBalance = uiAmount;
                    break;
            }
        })
    }

    return trtnBalance;
}

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
    'ADQwix6UMnhZ13iAd5xQMWFUuw8cJRGj1RioqP3GZebg',
  );
  
  async function findAssociatedTokenAddress(
      walletAddress: PublicKey,
      tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
      return (await PublicKey.findProgramAddress(
          [
              walletAddress.toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              tokenMintAddress.toBuffer(),
          ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      ))[0];
  }

export default useBasking