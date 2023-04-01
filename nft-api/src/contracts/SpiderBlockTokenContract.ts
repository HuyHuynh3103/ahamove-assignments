import { getRPC } from "./utils/common";
import { getSpiderBlockAbi } from "./utils/getAbis";
import { getSpiderBlockAddress } from "./utils/getAddress";
import { ethers } from "ethers";
import { Erc20 } from "./interfaces";
import { ConversionHelper } from "./helper";

export default class SpiderBlockTokenContract extends Erc20 {
    constructor(provider?: ethers.providers.Provider | ethers.Signer) {
        const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
        super(
            provider || rpcProvider,
            getSpiderBlockAddress(),
            getSpiderBlockAbi()
        );
        if (!provider) {
            this._contract = new ethers.Contract(
                this._contractAddress,
                this._abis,
                rpcProvider
            );
        }
    }
    async mint(_address: string, _amount: number): Promise<void> {
        const wei = ConversionHelper._toWei(_amount);
        await this._contract.mint(_address, wei), this._option;
    }
}
