"use client";

import { useCoinCharts } from "@/hooks/useCoinCharts";
import { useCoinDetails } from "@/hooks/useCoinDetails";
import { useMarkets } from "@/hooks/useMarkets";
import { formatLargeNumber } from "@/lib/format";
import { Coin } from "@/types/coin";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { Alert, AlertDescription } from "../ui/alert";
import { ChartsSection } from "./ChartsSection";
import { CoinDetailDialog } from "./CoinDetailDialog";
import { CoinsSection } from "./Coins/CoinsSection";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Loading } from "./Loading";
import { MarketOverview } from "./MarketOverview";
import { TopMovers } from "./TopMovers";

export default function Dashboard() {
  const {
    selectedCoin,
    isDialogOpen,
    detailsLoading,
    openCoin,
    closeDialog,
    error: coinDetailsError,
  } = useCoinDetails();

  const {
    charts,
    loadingByCoin,
    error: chartsError,
    requestChart,
  } = useCoinCharts();
  const {
    loading,
    error,
    coins,
    coinsRaw,
    topGainers,
    topLosers,
    marketOverview,
    searchTerm,
    sortBy,
    sortOrder,
    lastUpdated,
    setSearchTerm,
    setSortField,
    toggleSortOrder,
    refresh,
  } = useMarkets();

  useEffect(() => {
    const btc = coins.find((c) => c.id === "bitcoin");
    if (btc) {
      const price = parseFloat(btc.priceUsd).toFixed(2);
      document.title = `₿ $${price} | Crypto Dashboard`;
    }
  }, [coins]);

  const handleCoinClick = (coin: Coin) => {
    openCoin(coin);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <Alert className="max-w-2xl mx-auto mt-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Header
          title="Crypto Dashboard"
          subtitle="Real-time cryptocurrency market data"
          onRefresh={refresh}
          isLoading={loading}
        />
        {loading ? (
          <Loading />
        ) : (
          <Fragment>
            <MarketOverview
              marketCap={formatLargeNumber(marketOverview.marketCap)}
              volume24h={formatLargeNumber(marketOverview.volume24h)}
              btcDominance={`${marketOverview.btcDominance.toFixed(2)}%`}
              coinsCount={coinsRaw.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMovers
                title="Top Gainers (24h)"
                icon={TrendingUp}
                coins={topGainers}
                variant="gain"
              />

              <TopMovers
                title="Top Losers (24h)"
                icon={TrendingDown}
                coins={topLosers}
                variant="loss"
              />
            </div>

            <ChartsSection
              data={charts}
              loadingByCoin={loadingByCoin}
              onRequestChart={requestChart}
              error={chartsError}
            />

            <CoinsSection
              coins={coins}
              searchTerm={searchTerm}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchTermChange={setSearchTerm}
              onSortFieldChange={setSortField}
              onToggleSortOrder={toggleSortOrder}
              onCoinClick={handleCoinClick}
            />

            <CoinDetailDialog
              open={isDialogOpen}
              onOpenChange={(open) => !open && closeDialog()}
              coin={selectedCoin}
              isLoading={detailsLoading}
              error={coinDetailsError}
            />
          </Fragment>
        )}

        <Footer
          description="Data provided by CoinGecko API"
          lastUpdated={lastUpdated || ""}
        />
      </div>
    </div>
  );
}
