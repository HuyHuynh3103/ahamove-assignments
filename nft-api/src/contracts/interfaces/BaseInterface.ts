import { ethers, Overrides } from "ethers";

export default class BaseInterface {
    _provider: ethers.providers.Provider | ethers.Signer;
    _contractAddress: string;
    _abis: ethers.ContractInterface;
    _contract: ethers.Contract;
    _option: Overrides;

    constructor(
        provider: ethers.providers.Provider | ethers.Signer,
        address: string,
        abi: ethers.ContractInterface
    ) {
        this._provider = provider, 
		this._contractAddress = address;
        this._abis = abi;
        this._contract = new ethers.Contract(address, abi, provider);
        this._option = { gasLimit: 500000 };
    }
    _handleTransactionResponse = async (tx: any) => {
        try {
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (er: any) {
            throw new Error(er?.reason || `${er}`);
        }
    };
	connect = (signer: ethers.Signer) => {
		this._provider = signer;
		this._contract = this._contract.connect(signer);
		
		return this;
	};
}
