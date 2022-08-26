/* eslint-disable react/react-in-jsx-scope */
import * as anchor from "@project-serum/anchor";
import { Program, Provider, BN } from "@project-serum/anchor";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import Footer from "../components/Footer";

import type { NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import idl_type from "../lib/idl/nft_staker.json";
import idl_basking from "../lib/idl/basking_idl.json";
import { getLizardsForOwner, getNftsForOwner } from "../lib/mint-one-token";
import { programs } from "@metaplex/js";
import NFTLoader from "../components/NFTLoader";
import NFTLoaderB from "../components/NFTLoader_Basking";
import Bg from "../public/images/basking.png";
import Navigation from "../components/Navigation";
import { chunks } from "../utils/common";
import useBasking from "../hooks/useBasking";
import { motion } from "framer-motion";

const {
  metadata: { Metadata },
} = programs;

const redeemAllChunk = 10;

type jollyProgramState = {
  program: any;
  connection: any;
  jollyranch: any;
  jollyBump: any;
  recieverSplAccount: any;
  spl_token: any;
  splBump: any;
  wallet_token_account: any;
  jollyAccount: any;
};

type baskingProgramState = {
  programBasking: any;
  connection: any;
  jollyRanch: any;
  jollyBumpB: any;
  recieverSplAccountB: any;
  spl_token: any;
  splBumpB: any;
  wallet_token_account: any;
  baskingAccount: any;
  baskingGroup: any;
  timerStart: any;
  startDate: any;
  endDate: any;
  amountRedeemed: any;
  lizardType: any;
};

const Home: NextPage = () => {
  const wallet = useWallet();
  const [jollyState, setJollyState] = useState({} as jollyProgramState);
  const [baskingState, setBaskingState] = useState({} as baskingProgramState);
  const state = useBasking((state) => state.state);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [stakedMints, setStakedMints] = useState([]);
  // Basking NFTs
  const [baskingStakedNFTs, setBaskingStakedNFTs] = useState([]);
  const [baskingStakedMints, setBaskingsetStakedMints] = useState([]);
  const [isBasking, setIsBasking] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [baskingNfts, setBaskingNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [loadingNftsBasking, setLoadingNftsBasking] = useState(true);
  const [loadingStakes, setLoadingStakes] = useState(true);
  const [stakingRewardsBasking, setStakingRewardsBasking] = useState({});
  const [stakingRewards, setStakingRewards] = useState({});
  const [refreshStateCounter, setRefreshStateCounter] = useState(0);
  const [totalRatsStaked, setTotaRatsStaked] = useState(0);

  // const [amountRedeemed, setAmoutnredeemed] = useBasking((state) => state.state.)
  //Basking
  const [totalRatsStakedBasking, setTotaRatsStakedBasking] = useState(0);
  const initState = useBasking((state) => state.initState);
  const getStats = useBasking((state) => state.getStats);
  const [showMutants, setShowMutants] = useState(true);

  const loaderRef = useRef(null);
  const modalRef = useRef(null);
  const [loader, setLoader] = useState(0);

  const changeDeviants = (_) => {
    setShowMutants((prevStatte) => !prevStatte);
  };

  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
    delay: 0.5,
    x: { duration: 1 },
    default: { ease: "linear" },
  };

  const txTimeout = 10000;

  const refresh = async () => {
    setLoader(0);
    loaderRef.current.click();
    const downloadTimer = setInterval(() => {
      if (loader >= 5000) {
        clearInterval(downloadTimer);
      }
      setLoader((prevLoader) => prevLoader + 10);
    }, 10);
    setTimeout(() => {
      modalRef.current.click();
      // forceUpdate();
      setRefreshStateCounter(refreshStateCounter + 1);
      // refreshData();
    }, txTimeout + 10);
  };

  const idl = idl_type as anchor.Idl;
  const idlBasking = idl_basking as anchor.Idl;

  //Filter NFTs
  const stakeType = async (nft) => {
    // console.log('hi');
    // console.log('attributes', nft.attributes)
    let index = 0;
    let mutated = false;
    let lizard_type = 0;
    while (index < nft.attributes.length) {
      // console.log('nft_atribute', index, nft.attributes[index])
      if (
        nft.attributes[index].trait_type === "Lizard Type" &&
        nft.attributes[index].value === "Deviant"
      ) {
        lizard_type = 1;
        mutated = true;
      } else if (
        nft.attributes[index].trait_type === "Lizard Type" &&
        nft.attributes[index].value === "Corrupted"
      ) {
        lizard_type = 2;
        mutated = true;
      }
      index++;
    }

    if (mutated) {
      await stakeNFT_Basking(nft.mint, lizard_type);
    } else {
      await stakeNFT(nft.mint);
    }

    // await nfts.map((nft, i)=>{
    //   if(nft.attributes[i].trait_type === 'Lizard Type' && nft.attributes[i].value === 'Deviant'){

    //   }else{

    //   }
    // })
  };

  const stakeNFT = async (publicKey) => {
    const nft = new anchor.web3.PublicKey(publicKey);
    const stake = anchor.web3.Keypair.generate();
    const [stake_spl, stakeBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stake.publicKey.toBuffer()],
        jollyState.program.programId
      );

    let wallet_nft_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nft,
      wallet.publicKey
    );

    // check if token has an associated account
    // if not send from the wallet account
    const largestAccounts = await jollyState.connection.getTokenLargestAccounts(
      nft
    );

    // console.log("largestAccounts", largestAccounts);
    // const largestAccountInfo = await jollyState.connection.getParsedAccountInfo(
    //   largestAccounts.value[0].address
    // );
    // console.log(
    //   "largestAccounts.value[0].address",
    //   largestAccounts.value[0].address.toString()
    // );
    // console.log(largestAccountInfo.value.data.parsed.info.owner);
    const hasATA =
      largestAccounts.value[0].address.toString() ===
      wallet_nft_account.toString();
    if (!hasATA) {
      wallet_nft_account = largestAccounts.value[0].address;
    }

    // console.log("wallet_nft_account", wallet_nft_account.toString());

    await jollyState.program.rpc.stakeNft(stakeBump, {
      accounts: {
        authority: wallet.publicKey.toString(),
        stake: stake.publicKey.toString(),
        senderSplAccount: wallet_nft_account.toString(),
        recieverSplAccount: stake_spl.toString(),
        mint: nft.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
      signers: [stake],
    });
  };

  // console.log('basking', baskingState)

  const stakeNFT_Basking = async (publicKey, lizard_type) => {
    const nft = new anchor.web3.PublicKey(publicKey);
    const stake = anchor.web3.Keypair.generate();
    //basking
    const [stake_splB, stakeBumpB] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stake.publicKey.toBuffer()],
        baskingState.programBasking.programId
      );

    let userNftAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nft,
      wallet.publicKey
    );

    // check if token has an associated account
    // if not send from the wallet account
    //basking
    const largestAccountsB =
      await baskingState.connection.getTokenLargestAccounts(nft);
    // console.log("largestAccounts", largestAccounts);
    // const largestAccountInfo = await jollyState.connection.getParsedAccountInfo(
    //   largestAccounts.value[0].address
    // );
    // console.log(
    //   "largestAccounts.value[0].address",
    //   largestAccounts.value[0].address.toString()
    // );
    // console.log(largestAccountInfo.value.data.parsed.info.owner);
    const hasATA =
      largestAccountsB.value[0].address.toString() ===
      userNftAccount.toString();
    if (!hasATA) {
      userNftAccount = largestAccountsB.value[0].address;
    }

    // console.log(baskingState.programBasking.rpc.stakeNft())

    //basking
    await baskingState.programBasking.rpc.stakeNft(lizard_type, {
      accounts: {
        authority: wallet.publicKey.toString(),
        stake: stake.publicKey.toString(),
        userNftAccount: userNftAccount.toString(),
        programNftAccount: stake_splB.toString(),
        mint: nft.toString(),
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
      signers: [stake],
    });
  };

  const setupJollyRanch = async () => {
    const opts = {
      preflightCommitment: "processed" as ConfirmOptions,
    };
    let endpoint = JSON.parse(
      process.env.NEXT_PUBLIC_QUICKNODE_MAINNET_RPC_ENDPOINT
    );
    endpoint = endpoint[Math.floor(Math.random() * endpoint.length)];
    const network = endpoint;
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    const provider = new Provider(connection, wallet, opts.preflightCommitment);
    // set this to your program ID
    const shillCityCapital = new anchor.web3.PublicKey(
      "CgpQ89SyhGTBHhcBJf6jss388QouTeaFwSHtLVwNxYUy"
    );
    // extra program ID made to import akari missions data
    const reptilBasking = new anchor.web3.PublicKey(
      "9fN6cCpm1i1GKhXrAKJjXSFaUbjETYc43EKWf9Pu7pmN"
    );

    const program = new Program(idl, shillCityCapital.toString(), provider);
    const programBasking = new Program(
      idlBasking,
      reptilBasking.toString(),
      provider
    );

    // pda generation example
    const [jollyranch, jollyBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("jolly_account")],
        program.programId
      );

    // use your own token here ex CHEESE
    const spl_token = new anchor.web3.PublicKey(
      "ADQwix6UMnhZ13iAd5xQMWFUuw8cJRGj1RioqP3GZebg"
    );

    const [recieverSplAccount, splBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [jollyranch.toBuffer()],
        program.programId
      );

    const wallet_token_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      spl_token,
      wallet.publicKey
    );

    const jollyAccount = await program.account.jollyRanch.fetch(
      jollyranch.toString()
    );

    // console.log("jollyAccount", jollyAccount);
    // console.log("jollyAccount.amount", jollyAccount.amount.toString());
    // console.log(
    //   "jollyAccount.amountRedeemed",
    //   jollyAccount.amountRedeemed.toString()
    // );
    // console.log("program", program);
    // console.log("jollyAccount", jollyAccount);
    // console.log("jollyAccount amount", jollyAccount.amount.toNumber());
    // console.log(
    //   "jollyAccount amount redeemed",
    //   jollyAccount.amountRedeemed.toNumber()
    // );

    setJollyState({
      program,
      connection,
      jollyranch,
      jollyBump,
      recieverSplAccount,
      spl_token,
      splBump,
      wallet_token_account,
      jollyAccount,
    });
  };

  const setupJollyRanch_Basking = async () => {
    const opts = {
      preflightCommitment: "processed" as ConfirmOptions,
    };
    let endpoint = JSON.parse(
      process.env.NEXT_PUBLIC_QUICKNODE_MAINNET_RPC_ENDPOINT
    );
    endpoint = endpoint[Math.floor(Math.random() * endpoint.length)];
    const network = endpoint;
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    const provider = new Provider(connection, wallet, opts.preflightCommitment);
    // set this to your program ID
    const shillCityCapital = new anchor.web3.PublicKey(
      "CgpQ89SyhGTBHhcBJf6jss388QouTeaFwSHtLVwNxYUy"
    );
    // extra program ID made to import akari missions data
    const reptilBasking = new anchor.web3.PublicKey(
      "9fN6cCpm1i1GKhXrAKJjXSFaUbjETYc43EKWf9Pu7pmN"
    );

    const program = new Program(idl, shillCityCapital.toString(), provider);
    const programBasking = new Program(
      idlBasking,
      reptilBasking.toString(),
      provider
    );

    // pda generation example

    //Basking
    const [jollyRanch, jollyBumpB] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("jolly_account")],
        programBasking.programId
      );

    // use your own token here ex CHEESE
    const spl_token = new anchor.web3.PublicKey(
      "ADQwix6UMnhZ13iAd5xQMWFUuw8cJRGj1RioqP3GZebg"
    );
    //basking
    const [recieverSplAccountB, splBumpB] =
      await anchor.web3.PublicKey.findProgramAddress(
        [jollyRanch.toBuffer()],
        programBasking.programId
      );

    const jollyData = await programBasking.account.jollyRanch.fetch(jollyRanch);
    // console.log('JollyData', jollyData)
    const baskingGroup = jollyData.baskingGroup;
    const timerStart = jollyData.timerStart;
    const startDate = jollyData.startDate;
    const endDate = jollyData.endDate;
    const lizardType = jollyData.lizardType;
    const amountRedeemed = jollyData.amountRedeemed.toNumber();
    // console.log('amountredeemedJOLLY', amountRedeemed.toNumber())

    const wallet_token_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      spl_token,
      wallet.publicKey
    );

    const baskingAccount = await programBasking.account.jollyRanch.fetch(
      jollyRanch.toString()
    );
    // console.log("jollyAccount", jollyAccount);
    // console.log("jollyAccount.amount", jollyAccount.amount.toString());
    // console.log(
    //   "jollyAccount.amountRedeemed",
    //   jollyAccount.amountRedeemed.toString()
    // );
    // console.log("program", program);
    // console.log("jollyAccount", baskingAccount);
    // console.log("jollyAccount amount", baskingAccount.amount.toNumber());
    // console.log(
    //   "jollyAccount amount redeemed",
    //   baskingAccount.amountRedeemed.toNumber()
    // );
    setBaskingState({
      amountRedeemed,
      programBasking,
      connection,
      jollyRanch,
      jollyBumpB,
      recieverSplAccountB,
      spl_token,
      splBumpB,
      wallet_token_account,
      baskingAccount,
      baskingGroup,
      timerStart,
      endDate,
      startDate,
      lizardType,
    });
  };

  const getNftData = async (nft_public_key) => {
    // console.log("nft_public_key", nft_public_key);
    const tokenAccount = new anchor.web3.PublicKey(nft_public_key);
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [pda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new anchor.web3.PublicKey(tokenAccount.toString()).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    const stakingAccountInfo: any =
      await jollyState.connection.getParsedAccountInfo(pda);

    // console.log('baskingAccountInfo',JSON.stringify(baskingAccountInfo))

    //Different way to get data??
    const accountInfo: any = stakingAccountInfo;

    // console.log('accountInfo:',JSON.stringify(accountInfo))

    const metadata: any = new Metadata(
      wallet.publicKey.toString(),
      accountInfo.value
    );
    //basking metadata
    // const baskingMetadata: any = new Metadata(
    //   wallet.publicKey.toString(),
    //   baskingAccountInfo.value
    // );
    const uri = metadata.data.data.uri.replace(
      "nftstorage.link",
      "cf-ipfs.com"
    );
    // const b_uri = baskingMetadata.data.data.uri.replace("nftstorage.link", "cf-ipfs.com");
    const { data }: any = await axios.get(uri);
    // const { b_data }: any = await axios.get(b_uri);
    // console.log("data", data.toString());
    return data;
  };

  const getNftDataBasking = async (nft_public_key) => {
    // console.log("nft_public_key", nft_public_key);
    const tokenAccount = new anchor.web3.PublicKey(nft_public_key);
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [pda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new anchor.web3.PublicKey(tokenAccount.toString()).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    //basking accountInfo
    const baskingAccountInfo: any =
      await baskingState.connection.getParsedAccountInfo(pda);

    // console.log('baskingAccountInfo',JSON.stringify(baskingAccountInfo))

    //Different way to get data??
    const accountInfo: any = baskingAccountInfo;

    // console.log('accountInfo:',JSON.stringify(accountInfo))

    const metadata: any = new Metadata(
      wallet.publicKey.toString(),
      accountInfo.value
    );
    //basking metadata
    // const baskingMetadata: any = new Metadata(
    //   wallet.publicKey.toString(),
    //   baskingAccountInfo.value
    // );
    const uri = metadata.data.data.uri.replace(
      "nftstorage.link",
      "cf-ipfs.com"
    );
    // const b_uri = baskingMetadata.data.data.uri.replace("nftstorage.link", "cf-ipfs.com");
    const { data }: any = await axios.get(uri);
    // const { b_data }: any = await axios.get(b_uri);
    // console.log("data", data.toString());
    return data;
  };

  const getStakedNfts = async () => {
    // console.log("jollyState program", jollyState.program);
    const unWithdrawnNFTs = [];
    const newStakedNFTs = await jollyState.program.account.stake.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          // bytes: bs58.encode(wallet.publicKey.toBuffer()),
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ]);
    // console.log("newStakedNFTs", newStakedNFTs);
    await newStakedNFTs.map((stake) => {
      if (stake.account.withdrawn === false) {
        unWithdrawnNFTs.push(stake);
      }
    });
    // console.log("setting newStakedNFTs to unWithdrawnNFTs", unWithdrawnNFTs);

    setStakedNFTs(unWithdrawnNFTs);
    // console.log("stakedNfts on load:", stakedNfts);
    // return stakedNfts;
  };
  // {console.log(baskingState.programBasking.account.stake)}
  const getStakedNftsBask = async () => {
    // console.log("jollyState program", jollyState.program);
    const baskingUnWithdrawnNFTs = [];

    const newBaskingStakedNFTs =
      await baskingState.programBasking.account.stake.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            // bytes: bs58.encode(wallet.publicKey.toBuffer()),
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
    console.log("newStakedNFTs_Basking", newBaskingStakedNFTs);

    await newBaskingStakedNFTs.map((stake) => {
      if (stake.account.withdrawn === false) {
        baskingUnWithdrawnNFTs.push(stake);
      }
    });
    // console.log("setting newStakedNFTs to unWithdrawnNFTs", unWithdrawnNFTs);
    setBaskingStakedNFTs(baskingUnWithdrawnNFTs);
    // console.log("BaskStakedNfts on load:", stakedNfts);
    // return stakedNfts;
  };

  const getStakedMintsBasking = async () => {
    // console.log("running getStakedMints with these nft accounts:", stakedNFTs);
    // console.log("running getStakedMints with these nft accounts:", baskingStakedNFTs);

    const allStakedMintsBasking = await Promise.all(
      baskingStakedNFTs.map(async (nft_account_basking, i) => {
        console.log("nft_account_basking", nft_account_basking);
        const [stake_spl_bask, _stakeBumpB] =
          await anchor.web3.PublicKey.findProgramAddress(
            [nft_account_basking.publicKey.toBuffer()],
            baskingState.programBasking.programId
          );

        // console.log("stake_spl", stake_spl);
        // console.log("stake_spl", stake_spl.toString());

        let endpoint = JSON.parse(
          process.env.NEXT_PUBLIC_QUICKNODE_MAINNET_RPC_ENDPOINT as string
        );
        endpoint = endpoint[Math.floor(Math.random() * endpoint.length)];

        const nft_public_key_bask = await axios
          .post(endpoint, {
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [
              stake_spl_bask.toString(),
              {
                encoding: "jsonParsed",
              },
            ],
          })
          .then(async (res) => {
            // console.log("res", res);
            // console.log("res.data.result", res.data.result);
            // console.log(
            //   "returned res data in getStakedMints:",
            //   res.data.result.value.data.parsed
            // );
            // return res.data.value?.data.parsed.info.mint
            return res.data.result.value?.data.parsed.info.mint;
          });

        console.log("nft_public_key", nft_public_key_bask);

        if (nft_public_key_bask) {
          const nft = await getNftDataBasking(nft_public_key_bask);
          console.log("bskingNFT", nft);
          nft["nft_account"] = nft_account_basking;
          nft["nft_account"].id = i;
          // console.log("running pushed nft to mints", nft);
          // allStakedMints.push(nft);
          return nft;
        }
      })
    );
    // console.log("allStakedMints", allStakedMintsBasking);
    allStakedMintsBasking.map((nft) => {
      if (nft) {
        const mints = [
          "9Gd3CpPFgK5PbfRnEuhF2JmDSUFEyWkHPkB7GA4SfSdA",
          "APA8t9faSRNdZvB1opJvB5DQ8h3aeCFyNxZiaCMSArTZ",
          "FrLGhta8fHTcyFTqiTDUwiDiG59L5xnvnqJwS2ssVXu7",
          "662zoahSfHgZYjQ9bzcS8MzqRfsF2H1h549uZUebC4e6",
          "Fs9SpcHN8J7PN8gjmp7Xvhae8EA4Zwifa79eNCQHJNgW",
          "4j99GW37LGL1Er7otAsqRdWgNDt9srZguim9n4rFCoDj",
        ];

        let redemption_rate = 5;
        let basking_bonus = 1;
        let lizardType = nft.nft_account.account.lizardType;

        // console.log(
        //   "contract basking group",
        //   nft.nft_account.account.baskingGroup
        // );
        // console.log("state basking group", state.baskingGroup);

        if (nft.nft_account.account.baskingGroup === state.baskingGroup) {
          setIsBasking(!isBasking);
        }

        if (mints.includes(nft.nft_account.account.mint.toString())) {
          redemption_rate = 4.0;
        }
        const currDate = new Date().getTime() / 1000;
        const daysElapsed =
          Math.abs(currDate - nft.nft_account.account.startDate) /
          (60 * 60 * 24);
        const hoursElapsed =
          Math.abs(currDate - nft.nft_account.account.timerStart) /
          (60 * 60);
        const amountRedeemed = baskingState.amountRedeemed / 1e6;
        // console.log(
        //   "amountRedeemedBasjkdnfksjbnvf",
        //   baskingState.amountRedeemed / 1e6
        // );
        // let estimateRewards = (redemption_rate * daysElapsed) - amountRedeemed;
        let estimateRewards = (redemption_rate * daysElapsed);
        // console.log('jkhfgksjfhg', estimateRewards)
        if (isBasking && hoursElapsed < 24) {
          if (lizardType === 1) {
            redemption_rate = 6.0;
            basking_bonus = 2.0;
            estimateRewards = estimateRewards + basking_bonus;
          } else if (lizardType === 2) {
            redemption_rate = 7.0;
            basking_bonus = 2.0;
            estimateRewards = estimateRewards + basking_bonus;
          } else if (lizardType === 0) {
            redemption_rate = 5.0;
            basking_bonus = 1.0;
            estimateRewards = estimateRewards + basking_bonus;
          }
        }

        stakingRewardsBasking[nft.nft_account.id] = estimateRewards;
        // console.log('Stakngdfjskghjk', stakingRewardsBasking)
      }
    });
    setStakingRewardsBasking({ ...stakingRewardsBasking });
    // setInterval(() => {
    //   allStakedMints.map((nft) => {
    //     let percentage =
    //       (new Date().getTime() / 1000 -
    //         parseInt(nft.nft_account.account.startDate)) /
    //       (parseInt(nft.nft_account.account.endDate) -
    //         parseInt(nft.nft_account.account.startDate));
    //     let estimateRewards =
    //       nft.nft_account.account.amountOwed.toNumber() * percentage -
    //       nft.nft_account.account.amountRedeemed.toNumber();
    //     stakingRewards[nft.nft_account.id.toString()] =
    //       estimateRewards;
    //   });
    //   setStakingRewards({ ...stakingRewards });
    // }, 3000);
    // console.log("setStakedMints", allStakedMints);
    setLoadingStakes(false);
    setBaskingsetStakedMints(allStakedMintsBasking);
  };

  const getStakedMints = async () => {
    // console.log("running getStakedMints with these nft accounts:", stakedNFTs);
    // console.log("running getStakedMints with these nft accounts:", BaskingstakedNFTs);

    const allStakedMints = await Promise.all(
      stakedNFTs.map(async (nft_account, i) => {
        // console.log("nft_account", nft_account);
        const [stake_spl, _stakeBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [nft_account.publicKey.toBuffer()],
            jollyState.program.programId
          );

        // console.log("stake_spl", stake_spl);
        // console.log("stake_spl", stake_spl.toString());

        let endpoint = JSON.parse(
          process.env.NEXT_PUBLIC_QUICKNODE_MAINNET_RPC_ENDPOINT as string
        );
        endpoint = endpoint[Math.floor(Math.random() * endpoint.length)];

        const nft_public_key = await axios
          .post(endpoint, {
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [
              stake_spl.toString(),
              {
                encoding: "jsonParsed",
              },
            ],
          })
          .then(async (res) => {
            // console.log("res", res);
            // console.log("res.data.result", res.data.result);
            // console.log(
            //   "returned res data in getStakedMints:",
            //   res.data.result.value.data.parsed
            // );
            // return res.data.value?.data.parsed.info.mint
            return res.data.result.value?.data.parsed.info.mint;
          });

        // console.log("nft_public_key", nft_public_key);

        if (nft_public_key) {
          const nft = await getNftData(nft_public_key);
          // console.log("stakingNft", nft);
          nft["nft_account"] = nft_account;
          nft["nft_account"].id = i;
          // console.log("running pushed nft to mints", nft);
          // allStakedMints.push(nft);
          return nft;
        }
      })
    );
    // console.log("allStakedMints", allStakedMints);
    allStakedMints.map((nft) => {
      if (nft) {
        const mints = [
          "9Gd3CpPFgK5PbfRnEuhF2JmDSUFEyWkHPkB7GA4SfSdA",
          "APA8t9faSRNdZvB1opJvB5DQ8h3aeCFyNxZiaCMSArTZ",
          "FrLGhta8fHTcyFTqiTDUwiDiG59L5xnvnqJwS2ssVXu7",
          "662zoahSfHgZYjQ9bzcS8MzqRfsF2H1h549uZUebC4e6",
          "Fs9SpcHN8J7PN8gjmp7Xvhae8EA4Zwifa79eNCQHJNgW",
          "4j99GW37LGL1Er7otAsqRdWgNDt9srZguim9n4rFCoDj",
        ];

        let redemption_rate = 4;
        // let basking_bonus = 1;
        // let lizardType = state.lizardType

        if (mints.includes(nft.nft_account.account.mint.toString())) {
          redemption_rate = 4.0;
        }
        const currDate = new Date().getTime() / 1000;
        const daysElapsed =
          Math.abs(currDate - nft.nft_account.account.startDate) /
          (60 * 60 * 24);
        const hoursElapsed =
          Math.abs(currDate - nft.stakeAccount?.account.startDate) / (60 * 60);
        const amountRedeemed =
          nft.nft_account.account.amountRedeemed.toNumber() / 1e6;
        // console.log(
        //   "amountRedeemed_Staking",
        //   nft.nft_account.account
        // );
        let estimateRewards = redemption_rate * daysElapsed - amountRedeemed;
        
        stakingRewards[nft.nft_account.id.toString()] = estimateRewards;
      }
    });
    setStakingRewards({ ...stakingRewards });
    // setInterval(() => {
    //   allStakedMints.map((nft) => {
    //     let percentage =
    //       (new Date().getTime() / 1000 -
    //         parseInt(nft.nft_account.account.startDate)) /
    //       (parseInt(nft.nft_account.account.endDate) -
    //         parseInt(nft.nft_account.account.startDate));
    //     let estimateRewards =
    //       nft.nft_account.account.amountOwed.toNumber() * percentage -
    //       nft.nft_account.account.amountRedeemed.toNumber();
    //     stakingRewards[nft.nft_account.id.toString()] =
    //       estimateRewards;
    //   });
    //   setStakingRewards({ ...stakingRewards });
    // }, 3000);
    // console.log("setStakedMints", allStakedMints);
    setLoadingStakes(false);
    setStakedMints(allStakedMints.filter((e) => e));
  };

  const redeemRewardsBasking = async (nftPubKey) => {
    // console.log('stake', nftPubKey.toString())
    // console.log(' jollyranch', jollyState.jollyranch.toString())
    // console.log('authority', jollyState.program.provider.wallet.publicKey.toString())
    // console.log('senderSplAccount', jollyState.recieverSplAccount.toString())
    // console.log('recieverSplAccount', jollyState.wallet_token_account.toString())
    // console.log('mint', jollyState.spl_token.toString())
    // console.log('tokenProgram', TOKEN_PROGRAM_ID.toString())
    // console.log('systemProgram', anchor.web3.SystemProgram.programId.toString())
    // console.log('associatedTokenProgram', ASSOCIATED_TOKEN_PROGRAM_ID.toString())
    // console.log('rent', anchor.web3.SYSVAR_RENT_PUBKEY.toString())
    await baskingState.programBasking.rpc.redeemRewards({
      accounts: {
        stake: nftPubKey.toString(),
        jollyranch: baskingState.jollyRanch.toString(),
        authority:
          baskingState.programBasking.provider.wallet.publicKey.toString(),
        programSplAccount: "F9uQoFCeb2wTdEDc1shJeKK8b9fUq5UYe2d2Zv5Jtfr9",
        userSplAccount: baskingState.wallet_token_account.toString(),
        tokenMint: baskingState.spl_token.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
    // console.log(
    //   "sender token ending balance: ",
    //   await jollyState.program.provider.connection.getTokenAccountBalance(
    //     jollyState.wallet_token_account
    //   )
    // );
  };

  const redeemAllRewardsBasking = async () => {
    let tx;
    // Chunked request to prevent transaction too large error (1232 bytes)
    let i, j, stakedMintsChunked;
    for (i = 0, j = baskingStakedMints.length; i < j; i += redeemAllChunk) {
      tx = new anchor.web3.Transaction();
      stakedMintsChunked = baskingStakedMints.slice(i, i + redeemAllChunk);
      // do whatever
      for (let k = 0; k < stakedMintsChunked.length; k++) {
        const redeem =
          await baskingState.programBasking.instruction.redeemRewards({
            accounts: {
              stake: stakedMintsChunked[k].nftPubKey.toString(),
              jollyranch: baskingState.jollyRanch.toString(),
              authority:
                baskingState.programBasking.provider.wallet.publicKey.toString(),
              programSplAccount: "F9uQoFCeb2wTdEDc1shJeKK8b9fUq5UYe2d2Zv5Jtfr9",
              userSplAccount: baskingState.wallet_token_account.toString(),
              tokenMint: baskingState.spl_token.toString(),
              tokenProgram: TOKEN_PROGRAM_ID.toString(),
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
              systemProgram: anchor.web3.SystemProgram.programId.toString(),
              rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
            },
          });
        tx.add(redeem);
      }
      try {
        await baskingState.programBasking.provider.send(tx);
      } catch (err) {
        console.log(err);
        break;
      }
    }
  };

  const redeemRewards = async (nftPubKey) => {
    // console.log('stake', nftPubKey.toString())
    // console.log(' jollyranch', jollyState.jollyranch.toString())
    // console.log('authority', jollyState.program.provider.wallet.publicKey.toString())
    // console.log('senderSplAccount', jollyState.recieverSplAccount.toString())
    // console.log('recieverSplAccount', jollyState.wallet_token_account.toString())
    // console.log('mint', jollyState.spl_token.toString())
    // console.log('tokenProgram', TOKEN_PROGRAM_ID.toString())
    // console.log('systemProgram', anchor.web3.SystemProgram.programId.toString())
    // console.log('associatedTokenProgram', ASSOCIATED_TOKEN_PROGRAM_ID.toString())
    // console.log('rent', anchor.web3.SYSVAR_RENT_PUBKEY.toString())
    await jollyState.program.rpc.redeemRewards({
      accounts: {
        stake: nftPubKey.toString(),
        jollyranch: jollyState.jollyranch.toString(),
        authority: jollyState.program.provider.wallet.publicKey.toString(),
        senderSplAccount: jollyState.recieverSplAccount.toString(),
        recieverSplAccount: jollyState.wallet_token_account.toString(),
        mint: jollyState.spl_token.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
    // console.log(
    //   "sender token ending balance: ",
    //   await jollyState.program.provider.connection.getTokenAccountBalance(
    //     jollyState.wallet_token_account
    //   )
    // );
  };

  const redeemAllRewards = async () => {
    let tx;
    // Chunked request to prevent transaction too large error (1232 bytes)
    let i, j, stakedMintsChunked;
    for (i = 0, j = stakedMints.length; i < j; i += redeemAllChunk) {
      tx = new anchor.web3.Transaction();
      stakedMintsChunked = stakedMints.slice(i, i + redeemAllChunk);
      // do whatever
      for (let k = 0; k < stakedMintsChunked.length; k++) {
        const redeem = await jollyState.program.instruction.redeemRewards({
          accounts: {
            stake: stakedMintsChunked[k].nft_account.publicKey.toString(),
            jollyranch: jollyState.jollyranch.toString(),
            authority: jollyState.program.provider.wallet.publicKey.toString(),
            senderSplAccount: jollyState.recieverSplAccount.toString(),
            recieverSplAccount: jollyState.wallet_token_account.toString(),
            mint: jollyState.spl_token.toString(),
            systemProgram: anchor.web3.SystemProgram.programId.toString(),
            tokenProgram: TOKEN_PROGRAM_ID.toString(),
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
            rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
          },
        });
        tx.add(redeem);
      }
      try {
        await jollyState.program.provider.send(tx);
      } catch (err) {
        console.log(err);
        break;
      }
    }
  };

  const redeemNFTBasking = async (stakePubKey, nftPubKey) => {
    // console.log("stakesPubKey", stakePubKey.toString());
    // console.log("nftPubKey", nftPubKey.toString());
    const wallet_nft_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nftPubKey,
      baskingState.programBasking.provider.wallet.publicKey
    );
    // console.log("wallet_nft_account", wallet_nft_account.toString());
    const [stake_spl, _stakeBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stakePubKey.toBuffer()],
        baskingState.programBasking.programId
      );

    // console.log("stake_spl", stake_spl.toString());

    await baskingState.programBasking.rpc.redeemNft({
      accounts: {
        stake: stakePubKey.toString(),
        jollyranch: baskingState.jollyRanch.toString(),
        authority:
          baskingState.programBasking.provider.wallet.publicKey.toString(),
        programNftAccount: stake_spl.toString(),
        userNftAccount: wallet_nft_account.toString(),
        programSplAccount: "F9uQoFCeb2wTdEDc1shJeKK8b9fUq5UYe2d2Zv5Jtfr9",
        userSplAccount: baskingState.wallet_token_account.toString(),
        tokenMint: baskingState.spl_token.toString(),
        nftMint: nftPubKey.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
  };

  const redeemNFT = async (stakePubKey, nftPubKey) => {
    // console.log("stakesPubKey", stakePubKey.toString());
    // console.log("nftPubKey", nftPubKey.toString());
    const wallet_nft_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nftPubKey,
      jollyState.program.provider.wallet.publicKey
    );
    // console.log("wallet_nft_account", wallet_nft_account.toString());
    const [stake_spl, _stakeBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stakePubKey.toBuffer()],
        jollyState.program.programId
      );

    // console.log("stake_spl", stake_spl.toString());

    await jollyState.program.rpc.redeemNft({
      accounts: {
        stake: stakePubKey.toString(),
        jollyranch: jollyState.jollyranch.toString(),
        authority: jollyState.program.provider.wallet.publicKey.toString(),
        senderSplAccount: stake_spl.toString(),
        recieverSplAccount: wallet_nft_account.toString(),
        senderTritonAccount: jollyState.recieverSplAccount.toString(),
        recieverTritonAccount: jollyState.wallet_token_account.toString(),
        mint: jollyState.spl_token.toString(),
        nft: nftPubKey.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
  };
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const stakeNFTs_Bask = async (nftPubKeys: PublicKey[]) => {
    // getDeviants(jollyState.connection, wallet)
    try {
      let tx;
      for (const _chunck of chunks(nftPubKeys, 4)) {
        tx = new anchor.web3.Transaction();
        const signers = [];
        for (const _nftPubKey of _chunck) {
          const nft = new anchor.web3.PublicKey(_nftPubKey);
          let lizard_type = 0;
          // const saber = nft.toBuffer();
          // console.log("saber", saber);
          const stake = new anchor.web3.Keypair();
          signers.push(stake);
          const [stake_spl, stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
              [stake.publicKey.toBuffer()],
              baskingState.programBasking.programId
            );
          let wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft,
            baskingState.programBasking.provider.wallet.publicKey
          );

          // check if token has an associated account
          // if not send from the wallet account
          const largestAccounts =
            await baskingState.connection.getTokenLargestAccounts(nft);
          const hasATA =
            largestAccounts.value[0].address.toString() ===
            wallet_nft_account.toString();
          if (!hasATA) {
            wallet_nft_account = largestAccounts.value[0].address;
          }

          baskingNfts.map((nft, index) => {
            while (index < nft.attributes.length) {
              // console.log('nft_atribute', index, nft.attributes[index])
              if (
                nft.attributes[index].trait_type === "Lizard Type" &&
                nft.attributes[index].value === "Deviant"
              ) {
                lizard_type = 1;
              } else if (
                nft.attributes[index].trait_type === "Lizard Type" &&
                nft.attributes[index].value === "Corrupted"
              ) {
                lizard_type = 2;
              }
              index++;
            }
          });

          const stakeNftResult =
            await baskingState.programBasking.instruction.stakeNft(
              lizard_type,
              {
                accounts: {
                  authority: wallet.publicKey.toString(),
                  stake: stake.publicKey.toString(),
                  userNftAccount: wallet_nft_account.toString(),
                  programNftAccount: stake_spl.toString(),
                  mint: nft.toString(),
                  systemProgram: anchor.web3.SystemProgram.programId,
                  tokenProgram: TOKEN_PROGRAM_ID.toString(),
                  rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
                },
                signers: [stake],
              }
            );
          tx.add(stakeNftResult);
        }
        await baskingState.programBasking.provider.send(tx, signers);
      }
      await timeout(800);

      return true;
    } catch (e: any) {
      console.log("error calling rpc stakeNft", e);
      return false;
    }
  };

  const stakeAllNFTs_Bask = async () => {
    const unStakedNFTs = baskingNfts.map(
      (_unStakeNft: { mint: PublicKey }) => _unStakeNft.mint
    );
    return await stakeNFTs_Bask(unStakedNFTs);
  };

  const stakeNFTs = async (nftPubKeys: PublicKey[], lockPeriod: number) => {
    // getDeviants(jollyState.connection, wallet)
    try {
      let tx;
      for (const _chunck of chunks(nftPubKeys, 4)) {
        tx = new anchor.web3.Transaction();
        const signers = [];
        for (const _nftPubKey of _chunck) {
          const nft = new anchor.web3.PublicKey(_nftPubKey);
          // const saber = nft.toBuffer();
          // console.log("saber", saber);
          const stake = new anchor.web3.Keypair();
          signers.push(stake);
          const [stake_spl, stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
              [stake.publicKey.toBuffer()],
              jollyState.program.programId
            );
          let wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft,
            jollyState.program.provider.wallet.publicKey
          );

          // check if token has an associated account
          // if not send from the wallet account
          const largestAccounts =
            await jollyState.connection.getTokenLargestAccounts(nft);
          const hasATA =
            largestAccounts.value[0].address.toString() ===
            wallet_nft_account.toString();
          if (!hasATA) {
            wallet_nft_account = largestAccounts.value[0].address;
          }

          const stakeNftResult = await jollyState.program.instruction.stakeNft(
            stakeBump,
            {
              accounts: {
                authority:
                  jollyState.program.provider.wallet.publicKey.toString(),
                stake: stake.publicKey.toString(),
                senderSplAccount: wallet_nft_account.toString(),
                recieverSplAccount: stake_spl.toString(),
                mint: nft.toString(),
                systemProgram: anchor.web3.SystemProgram.programId.toString(),
                tokenProgram: TOKEN_PROGRAM_ID.toString(),
                rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
              },
              signers: [stake],
            }
          );
          tx.add(stakeNftResult);
        }
        await jollyState.program.provider.send(tx, signers);
      }
      await timeout(800);

      return true;
    } catch (e: any) {
      console.log("error calling rpc stakeNft", e);
      return false;
    }
  };

  const stakeAllNFTs = async (lockPeriod: number) => {
    const unStakedNFTs = nfts.map(
      (_unStakeNft: { mint: PublicKey }) => _unStakeNft.mint
    );
    return await stakeNFTs(unStakedNFTs, lockPeriod);
  };

  const unstakeAll = async (nfts: any[]) => {
    try {
      for (const _chunk of chunks(nfts, 5)) {
        const tx = new anchor.web3.Transaction();
        const signers = [];
        for (const nft of _chunk) {
          const wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft.nft_account.account.mint,
            jollyState.program.provider.wallet.publicKey
          );
          const [stake_spl, _stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
              [nft.nft_account.publicKey.toBuffer()],
              jollyState.program.programId
            );
          const rpcCall = await jollyState.program.instruction.redeemNft({
            accounts: {
              stake: nft.nft_account.publicKey.toString(),
              jollyranch: jollyState.jollyranch.toString(),
              authority:
                jollyState.program.provider.wallet.publicKey.toString(),
              senderSplAccount: stake_spl.toString(),
              recieverSplAccount: wallet_nft_account.toString(),
              senderTritonAccount: jollyState.recieverSplAccount.toString(),
              recieverTritonAccount: jollyState.wallet_token_account.toString(),
              mint: jollyState.spl_token.toString(),
              nft: nft.nft_account.account.mint.toString(),
              systemProgram: anchor.web3.SystemProgram.programId.toString(),
              tokenProgram: TOKEN_PROGRAM_ID.toString(),
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
              rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
            },
          });
          tx.add(rpcCall);
        }
        await jollyState.program.provider.send(tx);
        await timeout(900);
      }
      return true;
    } catch (e) {
      console.log("Error:", e);
      return false;
    }
  };

  const unstakeAllBasking = async (nfts: any[]) => {
    try {
      for (const _chunk of chunks(nfts, 5)) {
        const tx = new anchor.web3.Transaction();
        const signers = [];
        for (const nft of _chunk) {
          const wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft.nft_account.account.mint,
            baskingState.programBasking.provider.wallet.publicKey
          );
          const [stake_spl, _stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
              [nft.nft_account.publicKey.toBuffer()],
              baskingState.programBasking.programId
            );
          const rpcCall =
            await baskingState.programBasking.instruction.redeemNft({
              accounts: {
                stake: nft.nft_account.publicKey.toString(),
                jollyranch: baskingState.jollyRanch.toString(),
                authority:
                  baskingState.programBasking.provider.wallet.publicKey.toString(),
                programNftAccount: stake_spl.toString(),
                userNftAccount: wallet_nft_account.toString(),
                programSplAccount:
                  "F9uQoFCeb2wTdEDc1shJeKK8b9fUq5UYe2d2Zv5Jtfr9",
                userSplAccount: baskingState.wallet_token_account.toString(),
                tokenMint: baskingState.spl_token.toString(),
                nftMint: nft.nft_account.account.mint.toString(),
                tokenProgram: TOKEN_PROGRAM_ID.toString(),
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
              },
            });
          tx.add(rpcCall);
        }
        await baskingState.programBasking.provider.send(tx);
        await timeout(900);
      }
      return true;
    } catch (e) {
      console.log("Error:", e);
      return false;
    }
  };

  const getTotalStakedRats = async () => {
    // console.log("runnning total staked rats");
    let totalStillStaked = 0;
    const totalStaked = await jollyState.program.account.stake.all();

    // console.log("totalStaked", totalStaked);
    // if (totalStaked[0]) {
    //   console.log("totalStaked", totalStaked[0].account.authority.toString());
    // }
    await totalStaked.map((stake) => {
      if (stake.account.withdrawn === false) {
        totalStillStaked++;
      }
    });

    setTotaRatsStaked(totalStillStaked);
  };

  const getTotalStakedRatsBasking = async () => {
    // console.log("runnning total staked rats");
    let totalStillStaked = 0;
    const totalStakedBask =
      await baskingState.programBasking.account.stake.all();
    // console.log("totalStaked", totalStaked);
    // if (totalStaked[0]) {
    //   console.log("totalStaked", totalStaked[0].account.authority.toString());
    // }
    await totalStakedBask.map((stake) => {
      if (stake.account.withdrawn === false) {
        totalStillStaked++;
      }
    });
    setTotaRatsStakedBasking(totalStillStaked);
  };

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      await setupJollyRanch();
      // await setupJollyRanch_Basking();
    })();
  }, [wallet]);

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      // await setupJollyRanch();
      await setupJollyRanch_Basking();
    })();
  }, [wallet]);

  useEffect(() => {
    // console.log("jollyState refreshed");
    // console.log('jollyState[program]',jollyState["program"])
    if (jollyState["program"] && wallet.publicKey) {
      (async () => {
        setLoadingNfts(true);
        const nftsForOwner = await getLizardsForOwner(
          jollyState.connection,
          wallet.publicKey
        );

        // console.log("nftsforowner", nftsForOwner);
        setNfts(nftsForOwner as any);
        // console.log('nftsforOwner', nfts)
        setLoadingNfts(false);
      })();
      (async () => {
        await getTotalStakedRats();
        await getStakedNfts();
      })();
    } else {
      // console.log("reset jollyState");
      setStakedMints([]);
      setStakedNFTs([]);
      setNfts([]);
    }
  }, [jollyState, refreshStateCounter]);

  useEffect(() => {
    // console.log("jollyState refreshed");
    // console.log('baskingState[program]',baskingState["programBasking"])
    if (baskingState["programBasking"] && wallet.publicKey) {
      (async () => {
        setLoadingNftsBasking(true);
        const nftsForOwner = await getLizardsForOwner(
          baskingState.connection,
          wallet.publicKey
        );
        // console.log("nftsforowner", nftsForOwner);
        setBaskingNfts(nftsForOwner as any);
        // console.log('baskingNFTS', baskingNfts)
        setLoadingNftsBasking(false);
      })();
      (async () => {
        await getTotalStakedRatsBasking();
        await getStakedNftsBask();
      })();
    } else {
      // console.log("reset jollyState");
      setBaskingsetStakedMints([]);
      setBaskingStakedNFTs([]);
      setBaskingNfts([]);
    }
  }, [baskingState, refreshStateCounter]);

  useEffect(() => {
    if (stakedNFTs.length > 0) {
      setLoadingStakes(true);
      (async () => {
        await getStakedMints();
      })();
    } else {
      setLoadingStakes(false);
    }
  }, [stakedNFTs]);

  useEffect(() => {
    if (baskingStakedNFTs.length > 0) {
      setLoadingStakes(true);
      (async () => {
        await getStakedMintsBasking();
      })();
    } else {
      setLoadingStakes(false);
    }
  }, [baskingStakedNFTs]);

  useEffect(() => {
    async function init() {
      if (wallet.publicKey) {
        await initState(wallet);
        await getStats();
      }
    }
    init();
  }, [wallet]);

  return (
    <>
      <Head>
        <title>Reptilian Renegade | Staking</title>
        <meta
          name="description"
          content="An nft staking platform for Reptilian Renegade"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <main>
        <Navigation activeId="staking" />
        <div
          style={{
            backgroundImage: `url(${Bg.src})`,
            objectFit: "contain",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            zIndex: "10",
          }}
          className="grid grid-cols-1 min-h-screen bg-background text-neutral-content p-4 pt-36 bg-center"
        >
          {/* Loading Modal */}
          <a href="#loader" className="btn btn-primary hidden" ref={loaderRef}>
            open loader
          </a>
          <div id="loader" className="modal">
            <div className="modal-box stat bg-primary text-background rounded-md">
              <div className="stat-figure text-primary">
                <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost"></button>
              </div>
              <p style={{ fontFamily: "Archivo" }}>Loading...</p>
              <div className="stat-desc max-w-[90%]">
                <progress
                  value={loader}
                  max="5000"
                  className="progress progress-black"
                ></progress>
              </div>
              <a
                href="#"
                style={{ fontFamily: "Archivo" }}
                className="btn hidden"
                ref={modalRef}
              >
                Close
              </a>
            </div>
          </div>
          <div className="text-center col-span-1  max-w-1280px px-[20px] pb-20">
            <div className="grid-cols-3 ">
              {/* Navbar Section */}

              <div className="flex flex-row justify-between items-center w-full z-10 relative mb-[-1px] shadow-lg bg-background/90 backdrop-filter backdrop-blur-lg text-neutral-content rounded-box border-2 border-solid border-primary">
                <div className="px-8 mx-2 w-auto justify-center flex md:w-1/5">
                  <div
                    className="btn bg-primary hover:bg-primary my-2 rounded-md relative z-999 hover:scale-105 transition duration-100"
                    style={{ color: "#fff" }}
                  >
                    <WalletMultiButton
                      style={{
                        all: "unset",
                        height: "100%",
                        width: "100%",
                        zIndex: "999",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontFamily: "Archivo",
                        fontSize: "0.8rem",
                        color: "#140027",
                      }}
                    />
                  </div>
                </div>

                <div className=" flex justify-center w-auto ml-2 md:ml-0 sm:w-4/5">
                  <div className="">
                    {wallet.publicKey && (
                      <div className="hidden sm:block w-70 mt-2 m-2.5">
                        <div className="stat bg-primary rounded-md">
                          <div className="stat-value text-xl text-sitePurple">
                            {(
                              totalRatsStaked + totalRatsStakedBasking
                            ).toLocaleString("en-US")}
                            /4,000
                          </div>
                          <div className="stat-title text-sitePurple uppercase font-[Lacquer]">
                            Lizards Staked
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center md:w-[20%] w-auto">
                  {wallet.publicKey && (
                    <label
                      onClick={changeDeviants}
                      className="flex flex-col justify-center items-center cursor-pointer"
                    >
                      <div className="flex ">
                        <div className="relative">
                          <input
                            type="checkbox"
                            onClick={changeDeviants}
                            id="toggleB"
                            className="sr-only"
                            checked={showMutants}
                          />

                          <motion.div
                            layout
                            transition={spring}
                            className={`block w-14 h-8 rounded-full ${
                              showMutants ? "bg-gray-600" : "bg-red-200"
                            }`}
                          ></motion.div>

                          <div
                            className={`dot absolute w-6 h-6 rounded-full transition ${
                              showMutants
                                ? "left-1 top-1 bg-white"
                                : "right-1 top-1 bg-orange-600"
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className=" flex w-full text-gray-200 font-medium md:mt-1 font-[Lacquer]">
                        {showMutants ? "Normal Lizards" : "Mutated Lizards"}
                      </div>
                    </label>
                  )}
                </div>
              </div>
              {/* {console.log('baskingStakedMints', baskingStakedMints)} */}

              <div className="flex flex-col lg:flex-row-reverse z-0">
                <div className="w-full z-0 specific:w-1/2 border-2 border-primary bg-background/50 bg-glassTwo bg-cover border-t-0 backdrop-filter backdrop-blur-sm">
                  {/* begin app windows */}
                  {/*Snippet for conditional rendering if they are deviants or not*/}
                  {showMutants ? (
                    <div className="flex justify-center px-2 py-4 border-t-2 border-primary">
                      {loadingStakes && wallet.connected && (
                        <h1
                          className="text-lg font-400 animate-pulse"
                          style={{
                            fontFamily: "Archivo Black",
                            fontSize: "1.5rem",
                            color: "#D5D3D2",
                          }}
                        >
                          Loading your Staked NFT&apos;s, please wait...
                        </h1>
                      )}
                      {!wallet.connected && (
                        <p
                          style={{
                            fontFamily: "Archivo Black",
                            fontSize: "1.5rem",
                            color: "#D5D3D2",
                          }}
                        >
                          Please connect your wallet above
                        </p>
                      )}
                      {/* {console.log('stakedMints', stakedMints)} */}
                      {stakedMints.length > 0 && !loadingStakes && (
                        <div className="flex flex-col z-0">
                          <div className="flex flex-col justify-start items-center h-[70vh] overflow-y-scroll">
                            {/* redeem all snippet */}
                            <div className="navbar-end">
                              <div className="mr-4 justify-center align-center">
                                {stakedMints.length > redeemAllChunk && (
                                  <span className="text-[0.8rem] font-archivo leading-normal mt-2 block opacity-50">
                                    {Math.ceil(
                                      stakedMints.length / redeemAllChunk
                                    )}{" "}
                                    transactions will be prompted
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* end snippet */}

                            <div>
                              {totalRatsStaked > 1 && (
                                <div className="w-full flex justify-between px-4">
                                  <button
                                    className="btn text-lg btn-primary bg-pattern hover:scale-95 transition duration-100 bg-cover rounded-md text-background font-archivoBlack border-2 border-solid"
                                    onClick={async () => {
                                      await redeemAllRewards();
                                      await refresh();
                                    }}
                                  >
                                    Redeem All
                                  </button>
                                  <button
                                    className="btn text-lg bg-slate-800 bg-pattern hover:scale-95 transition duration-100 bg-cover rounded-md text-primary font-archivoBlack"
                                    onClick={async () => {
                                      await unstakeAll(stakedMints);
                                      await refresh();
                                    }}
                                  >
                                    Unstake All
                                  </button>
                                </div>
                              )}
                              {stakedMints.map((nft, i) => {
                                // console.log("mint nft", nft);
                                return (
                                  <NFTLoader
                                    key={i}
                                    isStaked={true}
                                    nft={nft}
                                    stakingRewards={stakingRewards}
                                    onRedeem={async () => {
                                      await redeemRewards(
                                        nft.nft_account.publicKey
                                      );
                                      await refresh();
                                    }}
                                    unStake={async () => {
                                      await redeemNFT(
                                        nft.nft_account.publicKey,
                                        nft.nft_account.account.mint
                                      );
                                      await refresh();
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      {stakedMints.length == 0 &&
                        !loadingStakes &&
                        wallet.publicKey && (
                          <p
                            className="text-lg font-400"
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            You don&apos;t have any lizards staked
                          </p>
                        )}
                    </div>
                  ) : (
                    <div className="flex justify-center px-2 py-4 border-t-2 border-primary">
                      {loadingStakes && wallet.connected && (
                        <h1
                          className="text-lg font-400 animate-pulse"
                          style={{
                            fontFamily: "Archivo Black",
                            fontSize: "1.5rem",
                            color: "#D5D3D2",
                          }}
                        >
                          Loading your Staked NFT&apos;s, please wait...
                        </h1>
                      )}
                      {!wallet.connected && (
                        <p
                          style={{
                            fontFamily: "Archivo Black",
                            fontSize: "1.5rem",
                            color: "#D5D3D2",
                          }}
                        >
                          Please connect your wallet above
                        </p>
                      )}
                      {/* {console.log("stakedMints", baskingStakedMints)} */}
                      {baskingStakedMints.length > 0 && !loadingStakes && (
                        <div className="flex flex-col z-0">
                          <div className="flex flex-col justify-start items-center h-[70vh] overflow-y-scroll">
                            {/* redeem all snippet */}
                            <div className="navbar-end">
                              <div className="mr-4 justify-center align-center">
                                {baskingStakedMints.length > redeemAllChunk && (
                                  <span className="text-[0.8rem] font-archivo leading-normal mt-2 block opacity-50">
                                    {Math.ceil(
                                      baskingStakedMints.length / redeemAllChunk
                                    )}{" "}
                                    transactions will be prompted
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* end snippet */}

                            <div>
                              {totalRatsStaked > 1 && (
                                <div className="w-full flex justify-between px-4">
                                  <button
                                    className="btn text-lg btn-primary bg-pattern hover:scale-95 transition duration-100 bg-cover rounded-md text-background font-archivoBlack border-2 border-solid"
                                    onClick={async () => {
                                      await redeemAllRewardsBasking();
                                      await refresh();
                                    }}
                                  >
                                    Redeem All
                                  </button>
                                  <button
                                    className="btn text-lg bg-slate-800 bg-pattern hover:scale-95 transition duration-100 bg-cover rounded-md text-primary font-archivoBlack"
                                    onClick={async () => {
                                      await unstakeAllBasking(
                                        baskingStakedMints
                                      );
                                      await refresh();
                                    }}
                                  >
                                    Unstake All
                                  </button>
                                </div>
                              )}
                              {baskingStakedMints.map((nft, i) => {
                                // console.log("mint nft", nft);
                                return (
                                  <NFTLoaderB
                                    key={i}
                                    isStaked={true}
                                    nft={nft}
                                    baskingGroup={state.baskingGroup}
                                    isBasking={isBasking}
                                    lizardType={
                                      nft.nft_account.account.lizardType
                                    }
                                    startDate={
                                      nft.nft_account.account.startDate
                                    }
                                    endDate={state.endDate}
                                    timerStart={state.timerStart}
                                    stakingRewards={stakingRewardsBasking}
                                    onRedeem={async () => {
                                      await redeemRewardsBasking(
                                        nft.nft_account.publicKey
                                      );
                                      await refresh();
                                    }}
                                    unStake={async () => {
                                      await redeemNFTBasking(
                                        nft.nft_account.publicKey,
                                        nft.nft_account.account.mint
                                      );
                                      await refresh();
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      {baskingStakedMints.length == 0 &&
                        !loadingStakes &&
                        wallet.publicKey && (
                          <p
                            className="text-lg font-400"
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            You don&apos;t have any lizards staked
                          </p>
                        )}
                    </div>
                  )}
                  {/*end of snippet*/}
                </div>

                {showMutants ? (
                  <div className="w-full specific:w-1/2 z-0 border-primary border-2 border-t-0 bg-background/50 bg-glass bg-cover backdrop-filter backdrop-blur-sm">
                    <div className="flex justify-center px-2 py-4 border-t-2 border-primary">
                      <div>
                        {loadingNfts && wallet.connected && (
                          <h1
                            className="text-lg font-bold animate-pulse"
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            Loading your NFT&apos;s, please wait...
                          </h1>
                        )}
                        {!wallet.connected && (
                          <p
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            Please connect your wallet above
                          </p>
                        )}
                        {!loadingNfts && wallet.connected && nfts.length === 0 && (
                          <h1
                            className="text-lg font-400"
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            You don&apos;t have any lizards in your wallet
                          </h1>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex flex-col justify-start items-center h-[70vh] overflow-y-scroll">
                          {nfts.map((nft, i) => {
                            if (
                              nft.attributes[i].trait_type === "Lizard Type" &&
                              (nft.attributes[i].value !== "Deviant" ||
                                nft.attributes[i].value !== "Corrupted")
                            ) {
                              <button
                                className="btn btn-primary bg-pattern rounded-md text-lg font-archivoBlack hover:scale-95 w-full"
                                onClick={async () => {
                                  await stakeAllNFTs(0);

                                  await refresh();
                                }}
                              >
                                Stake All
                              </button>;
                            }
                          })}

                          <div>
                            {nfts.map((nft, i) => {
                              if (
                                nft.attributes[i].trait_type ===
                                  "Lizard Type" &&
                                (nft.attributes[i].value === "Deviant" ||
                                  nft.attributes[i].value === "Corrupted")
                              ) {
                                nfts.filter(nft);
                                return (
                                  <NFTLoader
                                    key={nft.id}
                                    isStaked={false}
                                    nft={nft}
                                    onStake={async () => {
                                      // console.log(
                                      //   "mint, cheese, lockup: ",
                                      //   nft.mint,
                                      //   cheese,
                                      //   lockup
                                      // );
                                      await stakeType(nft);
                                      await refresh();
                                    }}
                                  />
                                );
                              } else {
                                return <></>;
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full specific:w-1/2 z-0 border-primary border-2 border-t-0 bg-background/50 bg-glass bg-cover backdrop-filter backdrop-blur-sm">
                    <div className="flex justify-center px-2 py-4 border-t-2 border-primary">
                      <div>
                        {loadingNftsBasking && wallet.connected && (
                          <h1
                            className="text-lg font-bold animate-pulse"
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            Loading your NFT&apos;s, please wait...
                          </h1>
                        )}
                        {!wallet.connected && (
                          <p
                            style={{
                              fontFamily: "Archivo Black",
                              fontSize: "1.5rem",
                              color: "#D5D3D2",
                            }}
                          >
                            Please connect your wallet above
                          </p>
                        )}
                        {!loadingNftsBasking &&
                          wallet.connected &&
                          baskingNfts.length === 0 && (
                            <h1
                              className="text-lg font-400"
                              style={{
                                fontFamily: "Archivo Black",
                                fontSize: "1.5rem",
                                color: "#D5D3D2",
                              }}
                            >
                              You don&apos;t have any lizards in your wallet
                            </h1>
                          )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex flex-col justify-start items-center h-[70vh] overflow-y-scroll">
                          {baskingNfts.length > 1 && (
                            <button
                              className="btn btn-primary bg-pattern rounded-md text-lg font-archivoBlack hover:scale-95 w-[92%]"
                              onClick={async () => {
                                await stakeAllNFTs_Bask();
                                await refresh();
                              }}
                            >
                              Stake All
                            </button>
                          )}
                          <div>
                            {baskingNfts.map((nft, i) => {
                              // console.log("baskingNgtsloader", baskingNfts);
                              let baskNfts = [];
                              if (
                                nft.attributes[i].trait_type ===
                                  "Lizard Type" &&
                                (nft.attributes[i].value === "Deviant" ||
                                  nft.attributes[i].value === "Corrupted")
                              ) {
                                baskNfts.push(nft);
                                if (baskNfts[i] === nft) {
                                  baskingNfts.filter(nft);
                                }
                              }
                              return (
                                <NFTLoaderB
                                  key={nft.id}
                                  isStaked={false}
                                  nft={nft}
                                  onStake={async () => {
                                    // console.log(
                                    //   "mint, cheese, lockup: ",
                                    //   nft.mint,
                                    //   cheese,
                                    //   lockup
                                    // );
                                    await stakeType(nft);
                                    await refresh();
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* end app windows */}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Home;
