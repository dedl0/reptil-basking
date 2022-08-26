import { FC, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import useBasking from "../hooks/useBasking";
import { NFT } from "../components/NFTLoader";
import sun from '../public/images/sun.png'

interface NFTLoader_BaskingProps {
  nft: NFT;
  onRedeem?: any;
  stakingRewards?: any;
  unStake?: any;
  isBasking?:any;
  onStake?:any;
  baskingGroup?: any;
  lizardType?: any;
  startDate?: any;
  endDate?: any;
  timerStart?: any;
  isStaked: boolean;
}

const NFTLoader_Basking: FC<NFTLoader_BaskingProps> = ({
  nft,
  baskingGroup,
  lizardType,
  startDate,
  endDate,
  timerStart,
  isBasking,
  stakingRewards,
  onStake,
  unStake,
  onRedeem,
  isStaked,
}) => {

  if (isStaked) {
    const timeLeft = 24 - timerStart
    return (
      <>
        {isBasking ? (<div className="relative !z-[9999] -bottom-12 flex"><img className="w-[3.5rem] h-[3.5rem] !z-[9999]" src={sun.src}/></div>):(<></>)}
          <div
          key={nft.id || Math.random()}
          className={`card h-auto md:card-side md:h-72 m-4 card-bordered border-primary rounded-md card-compact shadow-2xl text bg-background`}
          style={{ border: `solid ${isBasking ? '#dec744 3.5px': '#8CDE44 2px'}` }}
        > 
        
          <figure className="drop-shadow-md  w-72 h-72">
            <img src={nft.image} alt="Reptilian Renegade nft image" className='w-72 h-72' />
          </figure>
          
          <div className="card-body text-center items-center">
            <h2
              className="card-title"
              style={{ fontFamily: "Archivo Black", fontSize: `${isBasking ? '1rem': '1.4rem'}` }}
            >
              {isBasking ? (
                `${nft.name} - basking ends in: ${timeLeft}`
              ):(`${nft.name}`)}
            </h2>
            <div>
              <p className='text-gray-300 font-archivo'>Started</p>
              <p
                className="text-white text-sm"
                style={{ fontFamily: "Archivo", fontSize: "14px" }}
              >
                {new Date(
                  startDate * 1000
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
      </>
    );
  }else {
    // console.log("nft", nft);
    return (
      <div
        key={nft.id.toString() || Math.random()}
        className="card h-auto m-4 card-bordered card-compact md:card-side md:h-72 lg:card-normal shadow-2xl rounded-md text border-[2px] border-solid border-primary bg-background"
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

export default NFTLoader_Basking;
