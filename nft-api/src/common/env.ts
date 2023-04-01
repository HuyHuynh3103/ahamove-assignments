import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
	MINTER_PRIVATE_KEY: process.env.MINTER_PRIVATE_KEY,
	RPC_MAINNET: process.env.RPC_MAINNET,
	RPC_TESTNET: process.env.RPC_TESTNET,
	CHAIN_ID: process.env.CHAIN_ID,
	MORALIS_API_KEY: process.env.MORALIS_API_KEY,
}
