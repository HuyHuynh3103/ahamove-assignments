import { ethers } from 'ethers';
class AddressHelper{
	static toChecksumAddress(address: string) {
		return ethers.utils.getAddress(address);
	}
	static isAddress(address: string) {
		return ethers.utils.isAddress(address);
	}
	static isZeroAddress(address: string) {
		return ethers.constants.AddressZero === address;
	}
	static isChecksumAddress(address: string) {
		return ethers.utils.getAddress(address) === address;
	}
}

export default AddressHelper;