import type { Coin, SortField, SortOrder } from "@/types/coin";

export function sortCoins(coins: Coin[], field: SortField, order: SortOrder) {
  const sorted = [...coins].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    switch (field) {
      case "rank":
        aVal = parseInt(a.rank, 10);
        bVal = parseInt(b.rank, 10);
        break;
      case "price":
        aVal = parseFloat(a.priceUsd || "0");
        bVal = parseFloat(b.priceUsd || "0");
        break;
      case "change":
        aVal = parseFloat(a.changePercent24Hr || "0");
        bVal = parseFloat(b.changePercent24Hr || "0");
        break;
      case "marketCap":
        aVal = parseFloat(a.marketCapUsd || "0");
        bVal = parseFloat(b.marketCapUsd || "0");
        break;
      default:
        break;
    }

    return order === "asc" ? aVal - bVal : bVal - aVal;
  });

  return sorted;
}
