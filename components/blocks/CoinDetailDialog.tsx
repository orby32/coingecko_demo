"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLargeNumber, formatPercent, formatPrice } from "@/lib/format";
import type { Coin } from "@/types/coin";
import { AlertDescription } from "../ui/alert";

function getPriceColor(change: string | undefined) {
  if (!change) return "text-gray-500";
  const c = parseFloat(change);
  return c >= 0 ? "text-green-600" : "text-red-600";
}

interface CoinDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin?: Coin;
  isLoading?: boolean;
  error?: string;
}

export function CoinDetailDialog({
  open,
  onOpenChange,
  coin,
  isLoading = false,
  error,
}: CoinDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {coin && !error ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{coin.name}</DialogTitle>
              <DialogDescription>
                {coin.symbol} • Rank #{coin.rank}
              </DialogDescription>
            </DialogHeader>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      Current Price
                    </div>
                    <div className="text-2xl font-bold">
                      {coin.priceUsd ? formatPrice(coin.priceUsd) : "N/A"}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">24h Change</div>
                    <div
                      className={`text-2xl font-bold ${getPriceColor(
                        coin.changePercent24Hr
                      )}`}
                    >
                      {coin.changePercent24Hr
                        ? formatPercent(coin.changePercent24Hr)
                        : "N/A"}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Market Cap</div>
                    <div className="text-2xl font-bold">
                      {coin.marketCapUsd
                        ? formatLargeNumber(coin.marketCapUsd)
                        : "N/A"}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      Volume (24h)
                    </div>
                    <div className="text-2xl font-bold">
                      {coin.volumeUsd24Hr
                        ? formatLargeNumber(coin.volumeUsd24Hr)
                        : "N/A"}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      Circulating Supply
                    </div>
                    <div className="text-xl font-bold">
                      {coin.supply
                        ? `${parseFloat(coin.supply).toLocaleString()} ${coin.symbol}`
                        : "N/A"}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Max Supply</div>
                    <div className="text-xl font-bold">
                      {coin.maxSupply
                        ? `${parseFloat(coin.maxSupply).toLocaleString()} ${coin.symbol}`
                        : "Unlimited"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>VWAP (24h):</strong>{" "}
                    {coin.vwap24Hr ? formatPrice(coin.vwap24Hr) : "N/A"}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Volume Weighted Average Price over the last 24 hours
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <AlertDescription>{error}</AlertDescription>
        )}
      </DialogContent>
    </Dialog>
  );
}
