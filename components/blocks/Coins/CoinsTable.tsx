"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatLargeNumber, formatPercent, formatPrice } from "@/lib/format";
import type { Coin } from "@/types/coin";

export interface CoinsTableProps {
  coins: Coin[];
  onCoinClick: (coin: Coin) => void;
}

function PriceChange({ value }: { value: string }) {
  const num = parseFloat(value || "0");
  const color = num >= 0 ? "#16a34a" : "#dc2626";
  const Icon = num >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-end gap-1" style={{ color }}>
      <Icon className="w-4 h-4" />
      <span>{formatPercent(value)}</span>
    </div>
  );
}

export function CoinsTable({ coins, onCoinClick }: CoinsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Supply</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {coins.map((coin) => (
            <TableRow
              key={coin.id}
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => onCoinClick(coin)}
            >
              <TableCell>
                <Badge variant="outline">{coin.rank}</Badge>
              </TableCell>

              <TableCell className="font-semibold">{coin.name}</TableCell>

              <TableCell>
                <Badge variant="secondary">{coin.symbol}</Badge>
              </TableCell>

              <TableCell className="text-right font-mono">
                {coin.priceUsd ? formatPrice(coin.priceUsd) : "N/A"}
              </TableCell>

              <TableCell className="text-right">
                <PriceChange value={coin.changePercent24Hr} />
              </TableCell>

              <TableCell className="text-right">
                {coin.marketCapUsd
                  ? formatLargeNumber(coin.marketCapUsd)
                  : "N/A"}
              </TableCell>

              <TableCell className="text-right">
                {coin.volumeUsd24Hr
                  ? formatLargeNumber(coin.volumeUsd24Hr)
                  : "N/A"}
              </TableCell>

              <TableCell className="text-right">
                {coin.supply
                  ? `${parseFloat(coin.supply).toFixed(0)} ${coin.symbol}`
                  : "N/A"}
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCoinClick(coin);
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
