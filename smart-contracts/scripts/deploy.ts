import { Signer } from "ethers";
import { ethers } from "hardhat";
import ConfigFile from "../helpers/config";
import constants from "../helpers/constants";
import { deploy, deployProxy } from "../helpers/deploy";
import { parseEther } from "../helpers/ether-helper";
async function main() {
	// init
	const config = new ConfigFile();
	await config.initConfig();
  	const deployer: Signer = ethers.provider.getSigner();
  	console.log(`Signer Address: ${await deployer.getAddress()}`)
  	
	// deploy contract script 
	const tokenContract = await deployProxy([
		"SpiderBlock", "SPB"
	], "ERC20Token", config);	
	
	await deployProxy([
		tokenContract.address
	], "TokenLock", config);


	// update config
	await config.updateConfig();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
