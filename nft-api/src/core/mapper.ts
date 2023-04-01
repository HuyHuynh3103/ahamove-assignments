import { ENV } from "./../common/env";
class Mapper {
    static mapTxResponse = (data: { txHash?: string }) => {
        return {
            transactionHash: data?.txHash ?? "",
            rpc: data?.txHash ? this._mapRpc(data?.txHash) : "",
        };
    };

	static mapContractInfo = (data: { name?: string, symbol?: string}) => {
		return {
			name: data?.name ?? "",
			symbol: data?.symbol ?? "",
		}
	}


    private static _mapRpc = (tx: string) => {
        const { CHAIN_ID } = ENV;
        if (CHAIN_ID === "97") {
            return `https://testnet.bscscan.com/tx/${tx}`;
        }
        return `https://bscscan.com/tx/${tx}`;
    };
}
export default Mapper;
