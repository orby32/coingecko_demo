import { proxyToCoinGecko } from "@/lib/api/coingecko-proxy";

/**
 * GET /api/coingecko/markets
 * Proxies to CoinGecko coins/markets endpoint.
 * Query params: vs_currency, order, per_page, page, sparkline
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return proxyToCoinGecko("coins/markets", searchParams);
}
