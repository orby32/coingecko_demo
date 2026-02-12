"use client";

import { PricePoint } from "@/components/blocks/PriceChart";
import { useCallback, useMemo, useState } from "react";

export type CoinKey = "bitcoin" | "ethereum" | "cardano";

type ChartsState = Record<CoinKey, PricePoint[]>;
type LoadingState = Record<CoinKey, boolean>;

function marketChartUrl(coinId: string) {
  return `/api/coingecko/coins/${coinId}/market-chart?vs_currency=usd&days=1`;
}

export function useCoinCharts() {
  const [charts, setCharts] = useState<ChartsState>({
    bitcoin: [],
    ethereum: [],
    cardano: [],
  });

  const [loadingByCoin, setLoadingByCoin] = useState<LoadingState>({
    bitcoin: false,
    ethereum: false,
    cardano: false,
  });

  const [error, setError] = useState<string | undefined>(undefined);

  const hasChartData = useCallback(
    (coin: CoinKey) => (charts[coin]?.length ?? 0) > 0,
    [charts]
  );

  const isChartLoading = useCallback(
    (coin: CoinKey) => loadingByCoin[coin],
    [loadingByCoin]
  );

  const shouldRequestChart = useCallback(
    (coin: CoinKey) => !hasChartData(coin) && !isChartLoading(coin),
    [hasChartData, isChartLoading]
  );

  const requestChart = useCallback(
    async (coin: CoinKey) => {
      if (!shouldRequestChart(coin)) return;

      setLoadingByCoin((p) => ({ ...p, [coin]: true }));

      try {
        const res = await fetch(marketChartUrl(coin));
        if (!res.ok) throw new Error(`Chart fetch failed: ${coin}`);

        const json = await res.json();

        const formatted: PricePoint[] = (json.prices ?? []).map(
          (item: string) => ({
            time: new Date(item[0]).getHours() + ":00",
            price: item[1],
            date: new Date(item[0]).toISOString(),
          })
        );

        setCharts((p) => ({ ...p, [coin]: formatted }));
      } catch (e) {
        console.error(e);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoadingByCoin((p) => ({ ...p, [coin]: false }));
      }
    },
    [shouldRequestChart]
  );

  const resetCharts = useCallback(() => {
    setCharts({ bitcoin: [], ethereum: [], cardano: [] });
    setLoadingByCoin({ bitcoin: false, ethereum: false, cardano: false });
  }, []);

  return useMemo(
    () => ({
      charts,
      loadingByCoin,
      error,
      requestChart,
      resetCharts,
    }),
    [charts, loadingByCoin, requestChart, resetCharts, error]
  );
}
