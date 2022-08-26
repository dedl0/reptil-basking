import React from "react";
import Image from "next/image";

function Footer() {
  return (
    <footer className="w-screen py-4 flex justify-center items-center bg-primary  bg-pattern bg-cover">
      <div className="w-full max-w-[1280px] flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div className="flex flex-col gap-2 justify-center items-center">
        
        <a
          href="https://twitter.com/HydraLaunchpad"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/hydra.png"
            alt="Powered By Hydra Launchpad"
            width={90}
            height={37}
          />
        </a>
      
        <p className="text-black text-right uppercase font-archivoBlack text-xs">© 2022 Reptilian Renegade</p>
      </div>
        <div className="flex flex-col justify-center items-center">
          <div className="">
            <Image
              src="/images/Logo Black.png"
              alt="Reptilian Renegade Logo Black"
              width={200}
              height={65}
            />
          </div>
          <div className="flex gap-2 w-auto justify-center items-center sm:justify-end">
            <a
              href="https://twitter.com/reptilianrenegg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/twitter.png"
                alt="twitter"
                width={25}
                height={25}
              />
            </a>
            <a
              href="https://discord.gg/reptilianrenegade"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/discord.png"
                alt="discord"
                width={25}
                height={25}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
