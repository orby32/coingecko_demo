- **API key security** – Move API key from `NEXT_PUBLIC_` to server-only to prevent exposure in the browser. Created `api/coingecko` proxy routes.

- **Dedicated route per endpoint** – First implemented a single generic proxy (pass endpoint as query param), then switched to separate route files for each CoinGecko API used:

  - `GET /api/coingecko/markets` → `coins/markets` (coin list, used on load + refresh)
  - `GET /api/coingecko/coins/[id]/market-chart` → `coins/{id}/market_chart` (Bitcoin, Ethereum, Cardano charts)
  - `GET /api/coingecko/coins/[id]` → `coins/{id}` (coin details on click)

  **Trade-off:** Explicit per-endpoint routes give a clear API surface and better security (no arbitrary path access), but adding new CoinGecko features requires creating new route files instead of only changing the client. In our case of relatively small amount of endpoints, prefered the predictability and maintainability over make it generic.

- **Split `page.tsx` into focused components**
  - Header, Market Overview, Movers, Charts, Table, Dialog.
  - **Benefit:** smaller files, clearer responsibilities, easier maintenance.
  - **Tradeoff:** more files/props to manage; navigation between files is slightly more overhead.

- **Unified Top Gainers / Top Losers**

  - Single reusable movers component with configurable title/icon/variant + data.

- **Extracted reusable chart primitives**

  - `PriceChart` (Recharts wrapper) + `ChartsSection` (tabs + layout).
  - **Benefit:** consistent chart rendering, less repetition.

- **Lazy-loaded charts with per-coin loading**

  - Charts request data via callback (`onRequestChart`).
  - Replaced global `chartLoading` with `loadingByCoin`.
  - **Benefit:** fewer API calls, better UX, clearer state ownership.
  - **Tradeoff:** slightly more complex control flow;

- **`useCoinCharts` hook**

  - Owns charts data, `loadingByCoin`, and guarded fetch logic (`hasData`/`isLoading`).
  - **Benefit:** wrapper/page simplified; fetching logic isolated and reusable.
  - **Tradeoff:** debugging sometimes requires jumping between component + hook; hook dependencies/closures need care.

- **Moved formatting helpers to `lib`**
  - `formatPrice`, `formatLargeNumber`, `formatPercent`, `getPriceColor`.
  - **Benefit:** cleaner UI code, shared formatting logic.

-**
