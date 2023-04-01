export type AddressType = {
    97: string;
    56: string;
};

export enum CHAIN_ID {
    TESTNET = 97,
    MAINNET = 56,
}

export default function getChainIdFromEnv(): number {
    const env = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!env) {
        return 97;
    }
    return parseInt(env);
}

export const getRPC = () => {
    if (getChainIdFromEnv() === CHAIN_ID.MAINNET) {
        return process.env.NEXT_PUBLIC_RPC_MAINNET;
    }
    return process.env.NEXT_PUBLIC_RPC_TESTNET;
};

export const getDesiredGateWay = () => {
    return "https://cf-ipfs.com";
};

export const SMART_ADDRESS = {
    NFT: {
        97: "0x0986e90fdEFF82ad872E6240149F29AFf68F9119",
        56: "",
    },
    SPIDERBLOCK: {
        97: "0x2a47d693800350301ad76a736519d776E306f1d3",
        56: "",
    },
};
