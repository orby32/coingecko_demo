"use client";

import { useCallback, useRef, useState } from "react";

import type { Coin } from "@/types/coin";

type UseCoinDetailsReturn = {
  isDialogOpen: boolean;
  detailsLoading: boolean;
  openCoin: (coin: Coin) => void;
  closeDialog: () => void;
  clearSelected: () => void;
  error?: string;
  selectedCoin?: Coin;
};

function coinDetailsRouteUrl(id: string) {
  return `/api/coingecko/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;
}

export function useCoinDetails(): UseCoinDetailsReturn {
  const [selectedCoin, setSelectedCoin] = useState<Coin | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const abortRef = useRef<AbortController | null>(null);

  const openCoin = useCallback(async (coin: Coin) => {
    setError(undefined);
    setSelectedCoin(coin);
    setIsDialogOpen(true);
    setDetailsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(coinDetailsRouteUrl(coin.id), {
        signal: controller.signal,
      });
      if (!res.ok)
        throw new Error(`Coin details request failed: ${res.status}`);

      const data = await res.json();

      const transformed: Coin = {
        ...coin,
        vwap24Hr:
          data?.market_data?.current_price?.usd?.toString() || coin.priceUsd,
      };

      setSelectedCoin(transformed);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Error fetching coin details:", err);
      }
      setSelectedCoin(coin);
      setError("Failed to load coin details. Please try again later.");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const clearSelected = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSelectedCoin(undefined);
    setDetailsLoading(false);
    setError(undefined);
    setIsDialogOpen(false);
  }, []);

  return {
    selectedCoin,
    isDialogOpen,
    detailsLoading,
    openCoin,
    closeDialog,
    clearSelected,
    error,
  };
}
