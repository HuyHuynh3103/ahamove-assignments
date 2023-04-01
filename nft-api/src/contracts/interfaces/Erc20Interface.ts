import { ethers } from "ethers";
import { ConversionHelper } from "../helper";
import ErcStandardInterface from "./ErcStandardInterface";

class Erc20 extends ErcStandardInterface {
    constructor(
        provider: ethers.providers.Provider | ethers.Signer,
        address: string,
        abi: ethers.ContractInterface
    ) {
        super(provider, address, abi);
    }
    async approve(_address: string, _amount: number): Promise<string> {
        const wei = ConversionHelper._toWei(_amount);
        const tx = await this._contract.approve(_address, wei, this._option);
        return this._handleTransactionResponse(tx);
    }
    async transfer(_to: string, _amount: number): Promise<string> {
        const wei = ConversionHelper._toWei(_amount);
        const tx = await this._contract.tranfer(_to, wei, this._option);
        return this._handleTransactionResponse(tx);
    }
    async transferFrom(
        _from: string,
        _to: string,
        _amount: number
    ): Promise<string> {
        const wei = ConversionHelper._toWei(_amount);
        const tx = await this._contract.transferFrom(
            _from,
            _to,
            wei,
            this._option
        );
        return this._handleTransactionResponse(tx);
    }
}
export default Erc20;
