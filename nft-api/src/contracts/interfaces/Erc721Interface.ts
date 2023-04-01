import { ethers } from "ethers";
import { ConversionHelper } from "../helper";
import ErcStandardInterface from "./ErcStandardInterface";

class Erc721 extends ErcStandardInterface {
	constructor(
		provider: ethers.providers.Provider | ethers.Signer,
		address: string, 
		abi: ethers.ContractInterface
	) {
		super(provider, address, abi);
	}
	async approve(_address: string, _tokenId:number): Promise<string> {
		const tx = await this._contract.approve(_address, _tokenId, this._option);
		return this._handleTransactionResponse(tx);
	}
	async safeTransferFrom(_fromAddress: string, _toAddress: string, _tokenId: number): Promise<string> {
		const tx = await this._contract.safeTransferFrom(_fromAddress, _toAddress, _tokenId, this._option);
		return this._handleTransactionResponse(tx);
	}
	async setApproveForAll(_operator: string, _approved: boolean):  Promise<string> {
		const tx = await this._contract.setApproveForAll(_operator, _approved, this._option);
		return this._handleTransactionResponse(tx);
	}
	async getApproved(_tokenId: number): Promise<string> {
		const tx = await this._contract.getApproved(_tokenId, this._option);
		return this._handleTransactionResponse(tx);
	}
	async isApprovedForAll(_owner: string, _operator: string): Promise<boolean> {
		return await this._contract.isApprovedForAll(_owner, _operator);
	}
	async ownerOf(_tokenId: number): Promise<string>{
		return await this._contract.ownerOf(_tokenId);
	}
}
export default Erc721;