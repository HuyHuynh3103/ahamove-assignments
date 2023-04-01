import { getRPC } from './../contracts/utils/common';
import { ethers } from "ethers";
import { ENV } from "../common/env";
import NftContract from "../contracts/NftContract";
import CustomError from "../core/customError";
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
}

export default NftService;
