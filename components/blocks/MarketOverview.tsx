"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, Wallet } from "lucide-react";

type MarketOverviewProps = {
  marketCap: string;
  volume24h: string;
  btcDominance: string;
  coinsCount: number;
};

export function MarketOverview({
  marketCap,
  volume24h,
  btcDominance,
  coinsCount,
}: MarketOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Market Cap */}
      <Card
        style={{
          background: "linear-gradient(to bottom right, #3b82f6, #2563eb)",
          color: "#ffffff",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total Market Cap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{marketCap}</div>
          <p className="text-xs text-blue-100 mt-1">
            Across {coinsCount} cryptocurrencies
          </p>
        </CardContent>
      </Card>

      {/* 24h Volume */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            24h Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{volume24h}</div>
          <p className="text-xs text-purple-100 mt-1">Total trading volume</p>
        </CardContent>
      </Card>

      {/* BTC Dominance */}
      <Card
        style={{
          background: "linear-gradient(to bottom right, #f97316, #ea580c)",
          color: "white",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            BTC Dominance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{btcDominance}</div>
          <p className="text-xs text-orange-100 mt-1">Bitcoin market share</p>
        </CardContent>
      </Card>
    </div>
  );
}
