import controllerWrapper from "../core/controllerWrapper";
import Mapper from "../core/mapper";
import { NftService } from "../services";
import { IEvent } from "../_types_";

class NftController {
	// singleton
	private static _instance: NftController;
	static get instance() {
		if (!this._instance) {
			this._instance = new NftController();
		}
		return this._instance;
	}

    mint = controllerWrapper(async (event: IEvent) => {
        const address = event.body.address;
        const txHash = await NftService.instance.mintNft(address);
        return Mapper.mapTxResponse({
            txHash,
        });
    });

	getContractInfo = controllerWrapper(async (event: IEvent) => {
		const info = await NftService.instance.getNFTInfo();
		return Mapper.mapContractInfo(info);
	})
	
	getAllTransactions = controllerWrapper(async (event: IEvent) => {
		const address = event.query.address;
		const txs = await NftService.instance.getAllTransactions(address);
		return txs;
	})

}

export default NftController;
