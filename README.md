# shill-city-capital

adding this comment

Sea Shanties official staking repo.

There's a wallet you can load into your phantom in ./lib

To run just cd ./jollyranch
Then run yarn
Then run yarn dev

Load that wallet to see staked nfts and stakeable nfts

changed email

Hashlist updated. 

Wrote new keypair to /home/deadly/.config/solana/id.json
===========================================================================
pubkey: EpkRxnmpoVWit8hDxvsoxkjTmpQkspY2FpXqQoM8w4ub
===========================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
smooth perfect pink plate poet derive vessel boost potato cram obvious odor
===========================================================================

Program ID: DKWWiQiQHEbrSh4F4DURRjs2yGmTGzJFVr4q4J1jSg9T

Token Mint: Cp1turq69dHNsc2YHT9NcCzUzkKpUT6cA1VRUiJfco1m
Mint Authority: EpkRxnmpoVWit8hDxvsoxkjTmpQkspY2FpXqQoM8w4ub (i think this was the wallet I made it with)

- downgraded to anchor 0.19.0 with anchor avm https://book.anchor-lang.com/chapter_2/installation.html

Updated hashlist with devnet akari NFT's
Update anchor.toml changed cluster to devnet
ran anchor build -> anchor deploy to get new program ID -> 6zejHJyaQYmfZK16HcfFKGwAGQ7ToZNAGoVH8qn45p8w
update anchor.toml program id to -> 6zejHJyaQYmfZK16HcfFKGwAGQ7ToZNAGoVH8qn45p8w
update setupjolly ranch index.tsx with program ID and token ID -> 6zejHJyaQYmfZK16HcfFKGwAGQ7ToZNAGoVH8qn45p8w / AEpUXpn8K91NHWMQSvSRY4hfkUUUw5NJC65oWtk6e2zs

updated declareId in librs to new program id

- Do this in programs folder
// yarn add global mocha 
// yarn add global ts-mocha
// yarn add global @types/mocha @types/expect


change jolly_account to new account with new token, make token 1e6 6 decimals
tests/nft-staker.ts
lib.rs
pages/index.ts

new token - Cp1turq69dHNsc2YHT9NcCzUzkKpUT6cA1VRUiJfco1m
token account - 4Pa6UoTkvC6KXWmeEcKY3H2aTDzgy3HU62NfmTpEov2G
Minted 1,000,000 tokens
this is a 9 decimal token, the code is setup for a 6 decimal token
there are two 1e6 in lib.rs to change
1 in index.tsx
1 in tests/nft-staker.ts
I'll change them to 1e9 now

updating the token address in jollyranch index.tsx to Cp1turq69dHNsc2YHT9NcCzUzkKpUT6cA1VRUiJfco1m
also updated in tests/nft-staker.ts Cp1turq69dHNsc2YHT9NcCzUzkKpUT6cA1VRUiJfco1m
deleted generated key in target/deploy

changing hashmap to devnet akari nfts

New PROGRAM ID POG -> DKWWiQiQHEbrSh4F4DURRjs2yGmTGzJFVr4q4J1jSg9T



