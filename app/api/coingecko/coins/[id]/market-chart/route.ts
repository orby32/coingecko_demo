import { proxyToCoinGecko } from "@/lib/api/coingecko-proxy";

/**
 * GET /api/coingecko/coins/[id]/market-chart
 * Proxies to CoinGecko coins/{id}/market_chart endpoint.
 * Query params: vs_currency, days
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  return proxyToCoinGecko(`coins/${id}/market_chart`, searchParams);
}
