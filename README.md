# Ahamove Assignment

## Requirements
### 1/ Build and deploy smart contract to release token to few wallets for fixed schedule
### 2/ Design and build back-end architect for:
- Mintting NFT
- Getting all transaction related to NFTs in user wallet

## Assignment 1 
Address of smart contract on ```BSC Testnet```:
- TokenAddress: 
```
0x6CA44f04Af86Bff86D59c43935Bb9Cb185b7e299
```
- TokenLock: 
```
0x753AD129D635C8AeFb3FEd0F834408a4A3936B37
```

See file `test/TokenLock.spec.ts` for more details
How to deploy contract:
- Go to folder `smart-contracts` and run `npm install`
- Copy file `.env.example` to `.env` and fill in the information
- Fill in `PRIVATE_KEY` in `.env` file with deployer private key
- Deploy Token And TokenLock contract: `npm run deploy:bscTest` 

How to test:
- Go to folder `smart-contracts` and run `npm install`
- Run `npm run test`

How to use: 
- Owner call `createBatchSchedule` to create batch schedule or `createSchedule` to create single schedule
- When time is up, beneficiary can call `release` to claim token

## Assignment 2
Address of smart contract on ```BSC Testnet```:
- NFT: 
```
0x81cec8aC9f5e068f04a8De8225D985816370D5ee
```

How to use:
- Go to folder `nft-api` and run `npm install`
- Copy file `.env.example` to `.env` and fill in the information
- run `npm run dev` to start server

Api documents:
- Mint NFT: `POST /api/nft/mint` with body:
```
{
	"address": "0x329deB4343f9CA7B6234304C76A3BE1092C32065"
}
```
- Get all transaction related to NFTs in user wallet: `GET /api/nft/get-all-transaction?address=0x329deB4343f9CA7B6234304C76A3BE1092C32065`

Link to postman collection: 
```url
https://www.postman.com/huynh-ba-huy/workspace/ahamove/collection/17770807-f4e3323b-256c-4a66-850d-e77d8390b140?action=share&creator=17770807
```
