import { Signer } from "ethers";
import { ethers } from "hardhat";
import ConfigFile from "../helpers/config";
import { deploy, deployProxy } from "../helpers/deploy";
async function main() {
	// init
	const config = new ConfigFile();
	await config.initConfig();
  	const deployer: Signer = ethers.provider.getSigner();
  	console.log(`Signer Address: ${await deployer.getAddress()}`)
  	
	// // deploy contract script 
	const tokenContract = await deployProxy([
		"SpiderBlock", "SPB"
	], "ERC20Token", config);	
	
	await deployProxy([
		tokenContract.address
	], "TokenLock", config);

	// deploy erc721 contract
	await deploy([], "NFT", deployer, config);

	// update config
	await config.updateConfig();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
