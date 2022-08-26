import {Metaplex} from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const getDeviants = async (connection: Connection, wallet: AnchorWallet) => {
    const  metaplex = new Metaplex(connection)
    const userNfts = await metaplex.nfts().findAllByOwner({owner: wallet.publicKey}).run();

    const userDeviants = userNfts.filter(deviant => {
        console.log(deviant.address.toString())
    })
}

export default getDeviants