export type SortField = "rank" | "price" | "change" | "marketCap";
export type SortOrder = "asc" | "desc";

export interface Coin {
  id: string;
  rank: string;
  symbol: string;
  name: string;

  priceUsd: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;

  supply: string;
  maxSupply: string | null;

  vwap24Hr?: string;
}
