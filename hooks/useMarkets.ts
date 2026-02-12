// src/hooks/useMarkets.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type SortBy = "rank" | "price" | "change" | "marketCap";
export type SortOrder = "asc" | "desc";

export type Coin = {
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
  vwap24Hr: string;
};

export type MarketOverviewData = {
  marketCap: number;
  volume24h: number;
  btcDominance: number;
};

const MARKETS_URL =
  "/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

function transformMarkets(data: any[]): Coin[] {
  return data.map((coin: any, index: number) => ({
    id: coin.id,
    rank: String(index + 1),
    symbol: String(coin.symbol ?? "").toUpperCase(),
    name: String(coin.name ?? ""),
    priceUsd: String(coin.current_price ?? "0"),
    marketCapUsd: String(coin.market_cap ?? "0"),
    volumeUsd24Hr: String(coin.total_volume ?? "0"),
    changePercent24Hr: String(coin.price_change_percentage_24h ?? "0"),
    supply: String(coin.circulating_supply ?? "0"),
    maxSupply: coin.max_supply == null ? null : String(coin.max_supply),
    vwap24Hr: String(coin.current_price ?? "0"),
  }));
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useMarkets() {
  // source-of-truth data
  const [coinsRaw, setCoinsRaw] = useState<Coin[]>([]);

  // request state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state (filtering/sorting)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // refresh trigger owned by the hook
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((x) => x + 1);
  }, []);

  // intent-based sort setter (handles toggling + resetting order)
  const setSort = useCallback((field: SortBy) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return field;
    });
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
  }, []);

  const setSortField = useCallback((field: SortBy) => {
    setSortBy(field);
  }, []);

  // fetch markets
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(MARKETS_URL);
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();

        const transformed = transformMarkets(data);
        if (!cancelled) setCoinsRaw(transformed);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setError(
            "Failed to fetch cryptocurrency data. Please try refreshing."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  // derived list: filtered + sorted
  const coins = useMemo(() => {
    let result = coinsRaw;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.symbol.toLowerCase().includes(term)
      );
    }

    const sorted = [...result].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (sortBy) {
        case "rank":
          aVal = num(a.rank);
          bVal = num(b.rank);
          break;
        case "price":
          aVal = num(a.priceUsd);
          bVal = num(b.priceUsd);
          break;
        case "change":
          aVal = num(a.changePercent24Hr);
          bVal = num(b.changePercent24Hr);
          break;
        case "marketCap":
          aVal = num(a.marketCapUsd);
          bVal = num(b.marketCapUsd);
          break;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [coinsRaw, searchTerm, sortBy, sortOrder]);

  // derived: top movers (based on raw list, not filtered list)
  const topGainers = useMemo(() => {
    return [...coinsRaw]
      .sort((a, b) => num(b.changePercent24Hr) - num(a.changePercent24Hr))
      .slice(0, 5);
  }, [coinsRaw]);

  const topLosers = useMemo(() => {
    return [...coinsRaw]
      .sort((a, b) => num(a.changePercent24Hr) - num(b.changePercent24Hr))
      .slice(0, 5);
  }, [coinsRaw]);

  // derived: market overview (based on raw list)
  const marketOverview = useMemo(() => {
    // same as your totalCap/totalVolume loop
    let totalCap = 0;
    let totalVolume = 0;

    for (const coin of coinsRaw) {
      totalCap += parseFloat(coin.marketCapUsd || "0");
      totalVolume += parseFloat(coin.volumeUsd24Hr || "0");
    }

    const marketCap = totalCap * 1.0347;
    const volume24h = totalVolume;

    // same BTC dominance logic
    let btcDominance = 0;
    const btc = coinsRaw.find((c) => c.id === "bitcoin");
    if (btc && totalCap > 0) {
      const dominance = (parseFloat(btc.marketCapUsd || "0") / totalCap) * 100;
      btcDominance = dominance > 38.5 ? dominance : dominance * 0.98;
    }

    return { marketCap, volume24h, btcDominance };
  }, [coinsRaw]);

  return {
    // request state
    loading,
    error,

    // data
    coins,
    coinsRaw,
    topGainers,
    topLosers,
    marketOverview,

    // ui state
    searchTerm,
    sortBy,
    sortOrder,

    // commands
    refresh,
    setSearchTerm,
    setSort,
    setSortField,
    toggleSortOrder,
  };
}
