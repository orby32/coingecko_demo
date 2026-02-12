"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatPercent } from "@/lib/format";
import { LucideIcon } from "lucide-react";

type TopMoversProps = {
  title: string;
  icon: LucideIcon;
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    priceUsd: string;
    changePercent24Hr: string;
  }>;
  variant: "gain" | "loss";
};

export function TopMovers({
  title,
  icon: Icon,
  coins,
  variant,
}: TopMoversProps) {
  const isGain = variant === "gain";

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isGain ? "text-green-600" : "text-red-600"
          }`}
        >
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isGain
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isGain
                      ? "bg-green-200 text-green-700"
                      : "bg-red-200 text-red-700"
                  }`}
                >
                  {coin.symbol.charAt(0)}
                </div>

                <div>
                  <div className="font-semibold">{coin.name}</div>
                  <div className="text-sm text-gray-600">{coin.symbol}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {formatPrice(coin.priceUsd)}
                </div>
                <div
                  className={`font-medium ${
                    isGain ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercent(coin.changePercent24Hr)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
