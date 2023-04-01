import { ethers } from "ethers";
import { ConversionHelper } from "../helper";
import BaseInterface from "./BaseInterface";

class ErcStandardInterface extends BaseInterface {
	constructor(
		provider: ethers.providers.Provider | ethers.Signer,
		address: string, 
		abi: ethers.ContractInterface
	) {
		super(provider, address, abi);
	}
	
	async balanceOf(walletAddress: string): Promise<number>{
		const balance = await this._contract.balanceOf(walletAddress);
		return ConversionHelper._toNumber(balance);
	}
	async owner(): Promise<string> {
		return this._contract.owner();
	}
	async totalSuply(): Promise<number> {
		const total = await this._contract.totalSupply();
		return ConversionHelper._toNumber(total);
	}
	async name(): Promise<string> {
		return this._contract.name();
	}
	async symbol(): Promise<string> {
		return this._contract.symbol();
	}
}

export default ErcStandardInterface;