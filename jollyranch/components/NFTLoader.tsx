/* eslint-disable react/react-in-jsx-scope */
import { FC, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import useBasking from '../hooks/useBasking'

interface NFTLoaderProps {
  nft: NFT;
  isStaked: boolean;
  onStake?: any;
  onRedeem?: any;
  unStake?: any;
  stakingRewards?: any;
}
export interface NFT {
  id: number;
  attributes: any;
  image: string;
  name: string;
  mint: any;
  nft_account: any;
  stakeAccount?: {
    publicKey: PublicKey;
    account: {
      mint: PublicKey;
      startDate: number;
      endDate: number;
      timerStart: number;
      baskingGroup: number;
      lizardType: number;
      isStaked: boolean;
    };
  };
}

const NFTLoader: FC<NFTLoaderProps> = ({
  nft,
  isStaked,
  onStake,
  onRedeem,
  unStake,
  stakingRewards,
}) => {
  // we need to transform .link domain images to infura-ipfs.io.... .link domains are blocked by some internet providers
  //https://nftstorage.link/ipfs/bafybeifieqmth5eqhhvl6qcinsijlus3ajcid2dj7heih2szznzpvbuugi/2555.png
  //https://bafybeifieqmth5eqhhvl6qcinsijlus3ajcid2dj7heih2szznzpvbuugi.ipfs.infura-ipfs.io/2555.png
  const imageSplit = nft.image.split('/');


  if (isStaked) {
    return (
      <div
        key={nft.nft_account.id.toString() || Math.random()}
        className={`card h-auto md:card-side md:h-72 m-4 card-bordered border-primary rounded-md card-compact shadow-2xl text bg-background`}
        style={{ border: 'solid 2px #8CDE44' }}
      >
        <figure className="drop-shadow-md z-10 w-72 h-72">
          <img src={nft.image} alt="Reptilian Renegade nft image" className='w-72 h-72' />
          {/* {console.log('stakingNft',nft)} */}
        </figure>
        <div className="card-body text-center items-center">
          <h2
            className="card-title"
            style={{ fontFamily: "Archivo Black", fontSize: "1.4rem" }}
          >
            {nft.name}
          </h2>
          <div>
            <p className='text-gray-300 font-archivo'>Started</p>
            <p
              className="text-white text-sm"
              style={{ fontFamily: "Archivo", fontSize: "14px" }}
            >
              {new Date(
                nft.nft_account.account.startDate * 1000
              ).toLocaleDateString("en-US", {
                weekday: "short", // long, short, narrow
                day: "numeric", // numeric, 2-digit
                year: "numeric", // numeric, 2-digit
                month: "short", // numeric, 2-digit, long, short, narrow
                hour: "numeric", // numeric, 2-digit
                minute: "numeric", // numeric, 2-digit
              })}
            </p>
            <p className="mb-3"></p>
            <div className="">
              <p style={{ fontFamily: "Archivo" }} className='text-gray-300'>Estimate Rewards</p>
              <p
                className="font-bold"
                style={{ fontFamily: "Archivo", fontSize: "14px", color: "#f7752f" }}
              >
                {stakingRewards[nft.nft_account.id.toString()] > -1
                  ? stakingRewards[nft.nft_account.id.toString()].toFixed(6) + " $SIGHT"
                  : "Loading..."}
              </p>
            </div>
          </div>
          <div className="justify-center card-actions">
            <button
              style={{
                fontFamily: "Archivo",
                fontSize: "1rem",
                borderColor: "#8CDE44",
              }}
              className="btn bg-primary hover:scale-105 transition duration-100 text-background hover:bg-primary rounded-md badge-outline"
              onClick={onRedeem}
            >
              redeem
            </button>
            <button
              className="btn btn-ghost"
              onClick={unStake}
              style={{ fontFamily: "Archivo", fontSize: "1rem" }}
            >
              unstake
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // console.log("nft", nft);
    return (
      <div
        key={nft.id.toString() || Math.random()}
        className="card h-auto m-4 card-bordered card-compact md:card-side md:h-72 lg:card-normal shadow-2xl bg-background rounded-md text border-[2px] border-solid border-primary bg-background"
      >
        <figure>
          <img src={nft.image} alt="Reptilian Renegade nft image" className='h-72 w-72' />
        </figure>
        <div className="card-body flex justify-center">
          <h2
            className="card-title"
            style={{ fontFamily: "Archivo Black", fontSize: "1.4rem" }}
          >
            {nft.name}
          </h2>
          <button
            className="btn btn-primary hover:scale-105 transition duration-100 bg-primary hover:bg-primary rounded-md badge-outline mt-4"
            onClick={onStake}
            style={{
              fontFamily: "Archivo",
              fontSize: "1rem",
              border: "0",
            }}
          >
            Stake
          </button>
        </div>
      </div>
    );
  }
};

export default NFTLoader;
