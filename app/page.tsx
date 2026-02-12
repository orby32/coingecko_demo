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
import { ChartsSection, type CoinKey } from "@/components/blocks/ChartsSection";
import { useCoinCharts } from "@/hooks/useCoinCharts";

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

  const [coins, setCoins] = useState<any[]>([]);
  const [allCoins, setAllCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  const COINS: CoinKey[] = ["bitcoin", "ethereum", "cardano"];

  const [timeRange, setTimeRange] = useState("24h");
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topLosers, setTopLosers] = useState<any[]>([]);
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

  useEffect(() => {
    setLoading(true);
    fetch(MARKETS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json();
      })
      .then((data) => {
        // Transform CoinGecko data to match our structure
        const transformedData = data.map((coin: any, index: number) => ({
          id: coin.id,
          rank: (index + 1).toString(),
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          priceUsd: coin.current_price?.toString() || "0",
          marketCapUsd: coin.market_cap?.toString() || "0",
          volumeUsd24Hr: coin.total_volume?.toString() || "0",
          changePercent24Hr:
            coin.price_change_percentage_24h?.toString() || "0",
          supply: coin.circulating_supply?.toString() || "0",
          maxSupply: coin.max_supply?.toString() || null,
          vwap24Hr: coin.current_price?.toString() || "0",
        }));

        setCoins(transformedData);
        setAllCoins(transformedData);
        setLoading(false);

        // Calculate market stats
        let totalCap = 0;
        let totalVolume = 0;
        transformedData.forEach((coin: any) => {
          totalCap += parseFloat(coin.marketCapUsd || 0);
          totalVolume += parseFloat(coin.volumeUsd24Hr || 0);
        });
        setMarketCap(totalCap * 1.0347);
        setVolume24h(totalVolume);

        // Calculate BTC dominance
        const btc = transformedData.find((c: any) => c.id === "bitcoin");
        if (btc) {
          const dominance = (parseFloat(btc.marketCapUsd) / totalCap) * 100;
          setBtcDominance(dominance > 38.5 ? dominance : dominance * 0.98);
        }

        const sorted = [...transformedData].sort((a, b) => {
          return (
            parseFloat(b.changePercent24Hr || 0) -
            parseFloat(a.changePercent24Hr || 0)
          );
        });
        setTopGainers(sorted.slice(0, 5));
        setTopLosers(sorted.slice(-5).reverse());
      })
      .catch((err) => {
        console.error("Error fetching coins:", err);
        setError("Failed to fetch cryptocurrency data. Please try refreshing.");
        setLoading(false);
      });
  }, [refreshTrigger]);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term === "") {
      setCoins(allCoins);
    } else {
      const filtered = allCoins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(term.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(term.toLowerCase())
      );
      setCoins(filtered);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    const sorted = [...coins].sort((a, b) => {
      let aVal, bVal;

      if (field === "rank") {
        aVal = parseInt(a.rank);
        bVal = parseInt(b.rank);
      } else if (field === "price") {
        aVal = parseFloat(a.priceUsd || 0);
        bVal = parseFloat(b.priceUsd || 0);
      } else if (field === "change") {
        aVal = parseFloat(a.changePercent24Hr || 0);
        bVal = parseFloat(b.changePercent24Hr || 0);
      } else if (field === "marketCap") {
        aVal = parseFloat(a.marketCapUsd || 0);
        bVal = parseFloat(b.marketCapUsd || 0);
      } else {
        return 0;
      }

      if (sortOrder === "asc") {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    setCoins(sorted);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
          onRefresh={handleRefresh}
          isRefreshing={loading}
        />

        <MarketOverview
          marketCap={formatLargeNumber(marketCap)}
          volume24h={formatLargeNumber(volume24h)}
          btcDominance={`${btcDominance.toFixed(2)}%`}
          coinsCount={coins.length}
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

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>All Cryptocurrencies</CardTitle>
            <CardDescription>
              Browse and search through the top 50 cryptocurrencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => handleSort(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank">Rank</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="change">24h Change</SelectItem>
                    <SelectItem value="marketCap">Market Cap</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSort(sortBy)}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cryptocurrency Table */}
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coins.slice(0, 50).map((coin: any) => (
                    <TableRow
                      key={coin.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleCoinClick(coin)}
                    >
                      <TableCell>
                        <Badge variant="outline">{coin.rank}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {coin.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{coin.symbol}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {coin.priceUsd ? formatPrice(coin.priceUsd) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderPriceChange(coin.changePercent24Hr)}
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
                          ? `${parseFloat(coin.supply).toFixed(0)} ${
                              coin.symbol
                            }`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCoinClick(coin);
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

            {coins.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No cryptocurrencies found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </CardContent>
        </Card>

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
