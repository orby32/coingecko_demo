## 🛠️ Key Changes & Refactoring (Changelog)

### 1. API Security & Infrastructure

- **Server-Side Proxy:** Migrated all API keys from `NEXT_PUBLIC_` to server-only environment variables. Created dedicated `api/coingecko` proxy routes to prevent key exposure in the browser.
- **Explicit Routing:** Implemented separate route files for each endpoint (`/markets`, `/coins/[id]`, `/market-chart`) rather than a generic pass-through.
  - **Benefit:** Clear API surface and better security (no arbitrary path access).
  - **Trade-off:** New features require new route files, but the predictability and maintainability outweigh the overhead for this scale.

### 2. Component Architecture

- **Focused Slicing:** Broke down the monolithic `page.tsx` into domain-specific components: `Header`, `MarketOverview`, `TopMovers`, `ChartsSection`, `Footer` and `CoinsSection`.
- **Lazy-Loaded Charts:** Replaced global chart loading with a granular `loadingByCoin` state. Charts now request data via a callback (`onRequestChart`) only when needed.
  - **Benefit:** Fewer initial API calls and a significantly better UX.
- **Formatting Library:** Extracted logic into `lib/formatters.ts` to ensure consistent data presentation across the UI.

### 3. Logic & State Management (Custom Hooks)

- **`useMarkets` Hook:** Centralized markets fetching, sorting, and refresh logic.
- **`useCoinCharts` Hook:** Isolated chart-specific data fetching and guarded logic (`hasData`/`isLoading`).
- **Derived Data Pattern:** Converted market stats (Market Cap, Volume, BTC Dominance) into derived data using `useMemo`.
  - **Benefit:** Eliminates "out-of-sync" state bugs and reduces redundant `setState` calls.
  - **Trade-off:** Small recomputation cost (negligible for this dataset size).

---

## 🔍 Architectural Decisions & Trade-offs

- **Security Over Feature-Parity:** I prioritized moving API logic to the server-side first. A feature is only as good as its security; exposed keys are a critical business risk.
- **Hook-Based Abstraction:** I moved logic into custom hooks. Even without a global store, this structure makes the UI "dumb" and ensures that migrating to a state management library in the future is a trivial task.
- **Request Guarding:** I implemented a loading state lock on the refresh button to protect the API quota and prevent "race conditions" between concurrent fetches.

---

## 🚀 Production Roadmap & Future Improvements

To respect the 4-hour window, I focused on structural integrity. In a full production cycle, I would prioritize the following:

### 1. Robust Type Safety

- **Zod Validation:** Implement runtime validation for API responses to ensure the app fails gracefully if the external API contract changes.
- **Full TS Coverage:** Replace remaining `any` types with strict interfaces for all CoinGecko response objects.

### 2. Performance & Scalability

- **Pagination/virtual scrolling:** Implement for the coin list to handle datasets larger than 100+ items efficiently.
- **Debounced Refresh:** Add a 1-2 second debounce to the refresh trigger to prevent UI flickering during rapid interactions.

### 3. Testing Suite

- **Unit Tests:** Implement **Vitest** for the data-transformation logic in custom hooks.
- **E2E Testing:** Use **Playwright** to test the critical "Refresh" flow and error-handling states.

### 4. UX & Persistence

- **URL-Driven State:** Replace the uncompleted `localStorage` implementation for search with **URL Query Parameters** (`?search=btc&sort=price_desc`). This makes the dashboard state "shareable" and resilient to refreshes.
- **Sparklines:** Add 7-day trend visualizations to the table rows for immediate market context.

### 5. Observability

- **Error Monitoring:** Integrate **Sentry** to catch and track 429 (Rate Limit) errors and UI crashes in real-time.
