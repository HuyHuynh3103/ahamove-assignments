export interface IWalletInfo {
    address: string;
    nativeAmt: number;
}

export enum EToken {
    BNB = "BNB",
    USDT = "USDT",
}
export interface IPackage {
    key: string;
    name: string;
    amount: number;
    icon: string;
    bg: string;
    token: EToken;
}

export interface IMenu {
	header: string;
    name: string;
    url: string;
}

export interface IAttribute {
    trait_type: string;
    value: string | number;
}

export interface INftItem {
    id: number;
    name?: string;
    description?: string;
    image: string;
    attributes?: IAttribute[];
    // Listing
    price?: number;
    author?: string;
    // Auction
    owner?: string;
    ownerImage?: string;
    highestBid?: number;
}

export enum Clarity {
    "A",
    "B",
    "C",
    "D",
    "E",
    "S",
    "SS",
    "SSS",
}

export type ActionType = "LIST" | "UNLIST" | "TRANSFER" | "AUCTION";
export interface IAuctionInfo extends INftItem {
    auctionId: number;
    auctioneer: string;
    tokenId: number;
    initialPrice: number;
    previousBidder: string;
    lastBid: number;
    lastBidder: string;
    startTime: number;
    endTime: number;
    completed: boolean;
    active: boolean;
}
