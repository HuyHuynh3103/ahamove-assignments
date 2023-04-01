import controllerWrapper from "../core/controllerWrapper";
import Mapper from "../core/mapper";
import { NftService } from "../services";
import { IEvent } from "../_types_";

class NftController {
    mint = controllerWrapper(async (event: IEvent) => {
        const address = event.body.address;
        const txHash = await NftService.instance.mintNft(address);
        return Mapper.mapTxResponse({
            txHash,
        });
    });
}

export default new NftController();
