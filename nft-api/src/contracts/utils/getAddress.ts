import getChainIdFromEnv, { AddressType, SMART_ADDRESS } from "./common";

const getAddress = (address: AddressType) => {
    const CHAIN_ID = getChainIdFromEnv() as keyof AddressType;
    return address[CHAIN_ID];
};

export const getNftAddress = () => getAddress(SMART_ADDRESS.NFT);
export const getSpiderBlockAddress = () => getAddress(SMART_ADDRESS.SPIDERBLOCK);
