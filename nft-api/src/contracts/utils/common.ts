import { ENV } from "../../common/env";

export type AddressType = {
    97: string;
    56: string;
};

export enum CHAIN_ID {
    TESTNET = 97,
    MAINNET = 56,
}

export default function getChainIdFromEnv(): number {
    const env = ENV.CHAIN_ID ?? "97";
    return parseInt(env);
}

export const getRPC = () => {
    if (getChainIdFromEnv() === CHAIN_ID.MAINNET) {
        return ENV.RPC_MAINNET;
    }
    return ENV.RPC_TESTNET;
};

export const getDesiredGateWay = () => {
    return "https://cf-ipfs.com";
};

export const SMART_ADDRESS = {
    NFT: {
        97: "0x81cec8aC9f5e068f04a8De8225D985816370D5ee",
        56: "",
    },
};
