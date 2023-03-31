import { upgradeProxy } from "../helpers/upgrade";

async function main(): Promise<void> {
	upgradeProxy("TokenLock", "0x5A1F0E3C0372193207E9c3346a3CcE8e37d5e4a6")
}

main().catch((error)=>{
	console.error(error);
	process.exitCode = 1;
})