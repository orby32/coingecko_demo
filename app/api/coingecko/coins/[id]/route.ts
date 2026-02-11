import { proxyToCoinGecko } from "@/lib/api/coingecko-proxy";

/**
 * GET /api/coingecko/coins/[id]
 * Proxies to CoinGecko coins/{id} endpoint (coin details).
 * Query params: localization, tickers, community_data, developer_data
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  return proxyToCoinGecko(`coins/${id}`, searchParams);
}
