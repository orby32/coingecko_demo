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

- **Refactored Markets data handling into `useMarkets`**

- Moved **markets fetching**, **loading/error state**, and **refresh logic** into a dedicated `useMarkets` hook.
- Removed direct data-fetching logic from `page.tsx`.

**Benefits**

- Clear data ownership (markets data lives in one place)
- `page.tsx` is now mostly orchestration + layout
- Easier to test and reason about markets logic

**Trade-offs**

- Slightly more indirection when tracing where data comes from
- Requires discipline to not reintroduce data logic in the page

- **Converted market stats to derived (computed) data**

- Removed `marketCap`, `volume24h`, and `btcDominance` as local state.
- Reimplemented them as a derived `marketOverview` object using `useMemo`.

**Benefits**

- No risk of state getting out of sync with the coins list
- Fewer `setState` calls and side effects
- Logic matches the mental model: “derived from markets”
- Eliminates redundant state by treating derived values as computed data instead of stored state

**Trade-offs**

- Slight recomputation cost (acceptable for current dataset)
- Logic must remain pure (no side effects inside `useMemo`)

---

- **Split Coins table into `CoinsSection`**

- Extracted **search**, **sorting**, and **table rendering** into a dedicated component.
- `CoinsSection` receives data and handlers via props.

**Benefits**

- Page no longer mixes layout with table logic
- Easier to evolve the table independently (pagination, virtualization, etc.)
- Clear boundary between data source (`useMarkets`) and presentation

**Trade-offs**

- More props passed down
- Requires a stable hook API to avoid frequent refactors

---

### Removed obsolete handlers from `page.tsx`

- Eliminated `handleSearch`, `handleSort`, and `handleRefresh` from the page.
- All related logic is now owned by `useMarkets`.

**Benefits**

- Single source of truth for filtering and sorting behavior
- Cleaner, more declarative page component

**Trade-offs**

- Hook API becomes slightly larger

---

### Standardized sorting API

- Replaced combined sort logic with explicit handlers:
  - `setSortField`
  - `toggleSortOrder`

**Benefits**

- More explicit intent
- Easier to wire to UI controls

**Trade-offs**

- Two handlers instead of a single abstraction

---

### Notes

- Dialog and Footer remain in `page.tsx` intentionally (simple, UI-only concerns)
- Further extraction deferred to avoid premature abstraction
