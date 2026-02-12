"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Search, ArrowUpDown } from "lucide-react";
import { Header } from "@/components/blocks/Header";
import { MarketOverview } from "@/components/blocks/MarketOverview";
import { formatLargeNumber, formatPercent, formatPrice } from "@/lib/format";
import { TopMovers } from "@/components/blocks/TopMovers";
import { ChartsSection } from "@/components/blocks/ChartsSection";
import { CoinKey, useCoinCharts } from "@/hooks/useCoinCharts";
import { CoinsSection } from "@/components/blocks/Coins/CoinsSection";
import { useMarkets } from "@/hooks/useMarkets";
import { SortField } from "@/types/coin";

const MARKETS_URL =
  "/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

function coinDetailsUrl(coinId: string) {
  return `/api/coingecko/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
}

export default function Home() {
  const POLLING_INTERVAL = 30000;
  const MAX_RETRIES = 3;
  const CACHE_DURATION = 60000;
  const DEFAULT_PAGE_SIZE = 50;
  const STALE_DATA_THRESHOLD = 120000;

  const [allCoins, setAllCoins] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  const COINS: CoinKey[] = ["bitcoin", "ethereum", "cardano"];

  const [timeRange, setTimeRange] = useState("24h");
  const [marketCap, setMarketCap] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [btcDominance, setBtcDominance] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(1000);
  const [tableView, setTableView] = useState<"table" | "chart">("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [priceAlerts, setPriceAlerts] = useState<any[]>([])
  // const [favorites, setFavorites] = useState<string[]>([])
  // const [isDarkMode, setIsDarkMode] = useState(false)

  const { charts, loadingByCoin, requestChart } = useCoinCharts();
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
    setSearchTerm,
    setSortField,
    toggleSortOrder,
    refresh,
  } = useMarkets();

  // useEffect(() => {
  //   let cancelled = false;

  //   async function run() {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const res = await fetch(MARKETS_URL);
  //       if (!res.ok) throw new Error("API request failed");
  //       const data = await res.json();

  //       const transformed = data.map((coin: any, index: number) => ({
  //         id: coin.id,
  //         rank: String(index + 1),
  //         symbol: String(coin.symbol).toUpperCase(),
  //         name: coin.name,
  //         priceUsd: String(coin.current_price ?? "0"),
  //         marketCapUsd: String(coin.market_cap ?? "0"),
  //         volumeUsd24Hr: String(coin.total_volume ?? "0"),
  //         changePercent24Hr: String(coin.price_change_percentage_24h ?? "0"),
  //         supply: String(coin.circulating_supply ?? "0"),
  //         maxSupply: coin.max_supply ? String(coin.max_supply) : null,
  //         vwap24Hr: String(coin.current_price ?? "0"),
  //       }));

  //       if (!cancelled) {
  //         setCoinsRaw(transformed); // ✅ only source-of-truth update
  //       }
  //     } catch (e) {
  //       console.error(e);
  //       if (!cancelled) {
  //         setError(
  //           "Failed to fetch cryptocurrency data. Please try refreshing."
  //         );
  //       }
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   }

  //   run();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [refreshToken]);

  useEffect(() => {
    localStorage.setItem("cryptoSearchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const btc = coins.find((c) => c.id === "bitcoin");
    if (btc) {
      const price = parseFloat(btc.priceUsd).toFixed(2);
      document.title = `₿ $${price} | Crypto Dashboard`;
    }
  }, [coins]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPriceColor = (change: any) => {
    if (!change) return "text-gray-500";
    const c = parseFloat(change);
    return c >= 0 ? "text-green-600" : "text-red-600";
  };

  const handleCoinClick = (coin: any) => {
    setSelectedCoin(coin);
    setIsDialogOpen(true);
    setDetailsLoading(true);

    fetch(coinDetailsUrl(coin.id))
      .then((response) => response.json())
      .then((data) => {
        // Transform to match our structure
        const transformed = {
          ...coin,
          vwap24Hr:
            data.market_data?.current_price?.usd?.toString() || coin.priceUsd,
        };
        setSelectedCoin(transformed);
        setDetailsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coin details:", err);
        setSelectedCoin(coin);
        setDetailsLoading(false);
      });
  };

  // const toggleFavorite = (coinId: string) => {
  //   setFavorites(prev => {
  //     const newFavorites = prev.includes(coinId)
  //       ? prev.filter(id => id !== coinId)
  //       : [...prev, coinId]
  //     localStorage.setItem('favoriteCrypto', JSON.stringify(newFavorites))
  //     return newFavorites
  //   })
  // }

  // const isFavorite = (coinId: string) => favorites.includes(coinId)

  // const calculatePercentChange = (current: number, previous: number) => {
  //   return ((current - previous) / previous) * 100
  // }

  // const sortCoinsByVolume = (coins: any[]) => {
  //   return [...coins].sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
  // }

  const renderPriceChange = (change: any) => {
    if (!change) return <span style={{ color: "#6b7280" }}>0.00%</span>;
    const c = parseFloat(change);
    const color = c >= 0 ? "#16a34a" : "#dc2626";
    const icon =
      c >= 0 ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      );
    return (
      <div className="flex items-center gap-1" style={{ color: color }}>
        {icon}
        <span>{formatPercent(change)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

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
          title="Crypto Dashboard" // TODO: transaltion?
          subtitle="Real-time cryptocurrency market data" // // TODO: transaltion?
          onRefresh={refresh}
          isRefreshing={loading}
        />

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

        {/* Selected Coin Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedCoin && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedCoin.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCoin.symbol} • Rank #{selectedCoin.rank}
                  </DialogDescription>
                </DialogHeader>

                {detailsLoading ? (
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
                          {selectedCoin.priceUsd
                            ? formatPrice(selectedCoin.priceUsd)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          24h Change
                        </div>
                        <div
                          className={`text-2xl font-bold ${getPriceColor(
                            selectedCoin.changePercent24Hr
                          )}`}
                        >
                          {selectedCoin.changePercent24Hr
                            ? formatPercent(selectedCoin.changePercent24Hr)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Market Cap
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedCoin.marketCapUsd
                            ? formatLargeNumber(selectedCoin.marketCapUsd)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Volume (24h)
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedCoin.volumeUsd24Hr
                            ? formatLargeNumber(selectedCoin.volumeUsd24Hr)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Circulating Supply
                        </div>
                        <div className="text-xl font-bold">
                          {selectedCoin.supply
                            ? `${parseFloat(
                                selectedCoin.supply
                              ).toLocaleString()} ${selectedCoin.symbol}`
                            : "N/A"}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Max Supply
                        </div>
                        <div className="text-xl font-bold">
                          {selectedCoin.maxSupply
                            ? `${parseFloat(
                                selectedCoin.maxSupply
                              ).toLocaleString()} ${selectedCoin.symbol}`
                            : "Unlimited"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>VWAP (24h):</strong>{" "}
                        {selectedCoin.vwap24Hr
                          ? formatPrice(selectedCoin.vwap24Hr)
                          : "N/A"}
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        Volume Weighted Average Price over the last 24 hours
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 py-8 border-t">
          <p>Data provided by CoinGecko API</p>
          <p className="mt-1 text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// const CACHE_DURATION = 60000
// const MAX_ITEMS = 100
// const REFRESH_INTERVAL = 30000

// function debounce(func: Function, wait: number) {
//   let timeout: NodeJS.Timeout
//   return function executedFunction(...args: any[]) {
//     const later = () => {
//       clearTimeout(timeout)
//       func(...args)
//     }
//     clearTimeout(timeout)
//     timeout = setTimeout(later, wait)
//   }
// }
