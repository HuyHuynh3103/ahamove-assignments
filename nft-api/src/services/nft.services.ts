import { INftMoralisItem } from "./../_types_/index";
import getChainIdFromEnv, { getRPC } from "./../contracts/utils/common";
import { ethers } from "ethers";
import { ENV } from "../common/env";
import NftContract from "../contracts/NftContract";
import CustomError from "../core/customError";
import Moralis from "moralis";
import { EvmChain, EvmNft, GetWalletNFTsResponse } from "@moralisweb3/common-evm-utils";

class NftService {
    // singleton
    private static _instance: NftService;
    static get instance() {
        if (!this._instance) {
            this._instance = new NftService();
        }
        return this._instance;
    }
    private _nftContract: NftContract;
    constructor() {
        this._nftContract = new NftContract();
    }

    async mintNft(address: string) {
        if (ENV.MINTER_PRIVATE_KEY === undefined)
            throw CustomError.internal("Minter private key is not set");
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        const _minter = new ethers.Wallet(ENV.MINTER_PRIVATE_KEY, rpcProvider);
        console.log("Minter address: ", _minter.address);
        return await this._nftContract.connect(_minter).safeMint(address);
    }

    async getNFTInfo() {
        const name = await this._nftContract.name();
        const symbol = await this._nftContract.symbol();
        return {
            name,
            symbol,
        };
    }

    async getAllTransactions(address: string) {
        // get all transactions related to NFTs in user's wallet
        const chain =
            getChainIdFromEnv() === 97 ? EvmChain.BSC_TESTNET : EvmChain.BSC;
        const nftResponse = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain,
        });
        const nfts:EvmNft[] = nftResponse.result;
		// get only distinct NFTs
		// const distinctNfts = nfts.filter(
		// 	(nft, index, self) =>
		// 		index ===
		// 		self.findIndex(
		// 			(t) =>
		// 				t.tokenAddress === nft.tokenAddress 
		// 		)
		// );

		
        const result = await Promise.all(
            nfts.map(async (nft:EvmNft) => {
                const response = await Moralis.EvmApi.nft.getNFTTransfers({
                    address: nft.tokenAddress,
                    tokenId: nft.tokenId.toString(),
                    chain,
                });
				return {
					nft: {
						address: nft.tokenAddress.format(),
						tokenId: nft.tokenId,
					},
					transactions: response.result,
				};
            })
        );
		return result;
    }
}

export default NftService;
