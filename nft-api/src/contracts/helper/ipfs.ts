import {cid} from "is-ipfs";

export default class IpfsHelper {
    static containsCID = (
        url: string
    ): { containsCid: boolean; cid: string } => {
        const splitUrl = url.split(/\/|\?/);
        for (const split of splitUrl) {
            if (cid(split)) {
                return {
                    containsCid: true,
                    cid: split,
                };
            }
            const splitOnDot = split.split(".")[0];
            if (cid(splitOnDot)) {
                return {
                    containsCid: true,
                    cid: splitOnDot,
                };
            }
        }
        return {
            containsCid: false,
            cid: '',
        };
    };
    static parseToGateway(sourceUrl: string, desiredGatewayPrefix: string) {
        const { containsCid, cid } = this.containsCID(sourceUrl);
        if (!containsCid) {
            throw new Error("url does not contains CID");
        }
        const splitUrl = sourceUrl.split(cid);
        //case 1 - the ipfs://cid path
        if (sourceUrl.includes(`ipfs://${cid}`)) {
            return `${desiredGatewayPrefix}/ipfs/${cid}${splitUrl[1]}`;
        }

        //case 2 - the /ipfs/cid path (this should cover ipfs://ipfs/cid as well
        if (sourceUrl.includes(`/ipfs/${cid}`)) {
            return `${desiredGatewayPrefix}/ipfs/${cid}${splitUrl[1]}`;
        }

        //case 3 - the /ipns/cid path
        if (sourceUrl.includes(`/ipns/${cid}`)) {
            return `${desiredGatewayPrefix}/ipns/${cid}${splitUrl[1]}`;
        }
        //this is the fallback if no supported patterns are provided
        throw new Error(
            "unsupported URL pattern, please submit a github issue with the URL utilized"
        );
    }
}
