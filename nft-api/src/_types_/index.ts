export enum EToken {
    BNB = "BNB",
    USDT = "USDT",
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

export interface INftMoralisItem {
	token_id?: string;
	token_address?: string;
	token_uri?: string;
	owner_of?: string;
	amount?: string;
	contract_type?: string;
	name?: string;
	symbol?: string;
	metadata?: string;

}

export interface IEvent {
    params?: any
    query?: any
    body?: any
    baseUrl?: string
}
