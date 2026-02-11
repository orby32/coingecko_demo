import { NextResponse } from "next/server";

const API_BASE = process.env.COINGECKO_API_BASE ?? "https://api.coingecko.com/api/v3";

/**
 * Proxies a GET request to the CoinGecko API.
 * @param path - The API path (e.g. "coins/markets", "coins/bitcoin/market_chart")
 * @param searchParams - Query params to forward (from request.url)
 */
export async function proxyToCoinGecko(
  path: string,
  searchParams: URLSearchParams
): Promise<Response> {
  const upstream = new URL(`${API_BASE}/${path}`);
  searchParams.forEach((v, k) => upstream.searchParams.set(k, v));

  const key = process.env.COINGECKO_API_KEY;
  if (key) upstream.searchParams.set("x_cg_demo_api_key", key);

  const res = await fetch(upstream.toString(), {
    headers: { accept: "application/json" },
  });
  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
