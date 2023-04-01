import { getRPC } from "./utils/common";
import { getNftAbi } from "./utils/getAbis";
import { getNftAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { Erc721 } from "./interfaces";
import { AddressHelper } from "./helper";

export default class NftContract extends Erc721 {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(provider || rpcProvider, getNftAddress(), getNftAbi());
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    
	async safeMint(to: string): Promise<string> {
		// check to is valid address
		if(!AddressHelper.isAddress(to)){
			throw new Error("Invalid address");
		}
		const tx = await this._contract.safeMint(to, this._option);
		return this._handleTransactionResponse(tx);
	}
}
