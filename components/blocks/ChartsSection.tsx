"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChart, PricePoint } from "./PriceChart";
import { CoinKey } from "@/hooks/useCoinCharts";

type ChartsSectionProps = {
  data: Record<CoinKey, PricePoint[]>;
  loadingByCoin: Record<CoinKey, boolean>;
  onRequestChart: (coin: CoinKey) => void;
  defaultCoin?: CoinKey;
};

export function ChartsSection({
  data,
  loadingByCoin,
  onRequestChart,
  defaultCoin = "bitcoin",
}: ChartsSectionProps) {
  const [activeCoin, setActiveCoin] = React.useState<CoinKey>(defaultCoin);

  // Lazy-load the default tab on first render (or whenever default changes)
  React.useEffect(() => {
    const hasData = data[activeCoin]?.length > 0;
    const isLoading = loadingByCoin[activeCoin];
    if (!hasData && !isLoading) {
      onRequestChart(activeCoin);
    }
  }, [activeCoin, data, loadingByCoin, onRequestChart]);

  const handleTabChange = (value: string) => {
    const coin = value as CoinKey;
    setActiveCoin(coin);

    const hasData = data[coin]?.length > 0;
    const isLoading = loadingByCoin[coin];
    if (!hasData && !isLoading) {
      onRequestChart(coin);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Charts (24h)</CardTitle>
        <CardDescription>
          Hourly price movements for top cryptocurrencies
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeCoin}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="cardano">Cardano</TabsTrigger>
          </TabsList>

          <TabsContent value="bitcoin">
            {loadingByCoin.bitcoin ? (
              <LoadingChart />
            ) : (
              <PriceChart
                data={data.bitcoin}
                gradientId="colorBtc"
                stroke="#f7931a"
              />
            )}
          </TabsContent>

          <TabsContent value="ethereum">
            {loadingByCoin.ethereum ? (
              <LoadingChart />
            ) : (
              <PriceChart
                data={data.ethereum}
                gradientId="colorEth"
                stroke="#627eea"
              />
            )}
          </TabsContent>

          <TabsContent value="cardano">
            {loadingByCoin.cardano ? (
              <LoadingChart />
            ) : (
              <PriceChart
                data={data.cardano}
                gradientId="colorAda"
                stroke="#0033ad"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoadingChart() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <div className="text-gray-500">Loading chart...</div>
    </div>
  );
}
