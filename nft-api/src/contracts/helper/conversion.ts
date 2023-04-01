import { BigNumber, ethers } from "ethers";

export default class ConversionHelper {
	static _numberToEth = (amount: number) => {
		return ethers.utils.parseEther(amount.toString());
	}
	static _toNumber = (bigNumber: BigNumber) => {
		try{
			return bigNumber.toNumber()
		} catch(er:any) {
			return Number.parseFloat(ethers.utils.formatEther(bigNumber));
		}
	}
	static _toEther = (bigNumber: BigNumber) => {
		return Number.parseFloat(ethers.utils.formatEther(bigNumber));
	}
	static _toWei = (amount: number) => {
		return ethers.utils.parseUnits(amount.toString())
	}
}

