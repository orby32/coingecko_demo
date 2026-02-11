1. **API key security** – Move API key from `NEXT_PUBLIC_` to server-only to prevent exposure in the browser. Created `api/coingecko` proxy routes.

2. **Dedicated route per endpoint** – Replaced the single generic proxy (endpoint as query param) with separate route files for each CoinGecko API used:
   - `GET /api/coingecko/markets` → CoinGecko `coins/markets` (coin list, used on load + refresh)
   - `GET /api/coingecko/coins/[id]/market-chart` → CoinGecko `coins/{id}/market_chart` (Bitcoin, Ethereum, Cardano charts)
   - `GET /api/coingecko/coins/[id]` → CoinGecko `coins/{id}` (coin details on click)
   
   **Trade-off:** Explicit per-endpoint routes give a clear API surface and better security (no arbitrary path access), but adding new CoinGecko features requires creating new route files instead of only changing the client.