# Railway Controller Dashboard

A production-ready Railway Controller’s Dashboard built with Next.js App Router, Tailwind CSS, React Query, Recharts, visx (Gantt), Leaflet/Mapbox (map), Axios (REST), and WebSockets for live updates. Dark, responsive UI with modular components.

## Features
- Authentication: Mock login page storing a token and redirecting to protected routes
- Navigation: Collapsible sidebar + topbar with controller info and logout
- Dashboard: KPI cards (total trains, conflicts, avg delay, on-time %) and AI recommendation cards
- Gantt: Interactive schedule view with conflict highlights and drag-to-reorder that POSTs /api/override
- Map: Live train positions with markers showing TrainID, speed, delay, and priority color coding
- Data: React Query + Axios for REST (caching, retries) and a resilient WebSocket hook for live updates
- UX: Dark mode, responsive layout, smooth transitions via Framer Motion

## Tech Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS (dark mode, responsive)
- Data: React Query, Axios
- Charts: Recharts (KPIs), @visx/* (Gantt)
- Map: react-leaflet (default) or Mapbox GL (optional)
- Realtime: WebSockets
- Animations: Framer Motion

## Project Structure (high level)
- app/
  - login/ (public)
  - (protected)/dashboard, (protected)/gantt, (protected)/map, (protected)/settings
- components/
  - Sidebar, Topbar, KpiCard, RecommendationCard, Gantt components, Map components
  - providers/query-provider
- hooks/
  - useTrainData, useWebSocket
- lib/
  - api (Axios instance), utils

## Environment Variables
Create a .env.local for local development using the template in .env.example. In Vercel/v0, set these in Project Settings.

- NEXT_PUBLIC_API_BASE_URL: Base URL for REST (e.g., https://api.example.com)
- NEXT_PUBLIC_WS_BASE_URL: WebSocket base (e.g., wss://api.example.com). If unset, it will be derived from NEXT_PUBLIC_API_BASE_URL.
- NEXT_PUBLIC_MAP_TILES_URL: Optional custom tiles URL for Leaflet (defaults to OpenStreetMap)
- NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: Optional if you switch to Mapbox GL

Note: In Next.js, only variables prefixed with NEXT_PUBLIC_ are available on the client.

## REST and WebSocket Endpoints
- GET /api/schedule → schedules & conflicts
- GET /api/recommendations → AI-optimized order
- POST /api/override → manual order after Gantt reorder
- POST /api/simulate-delay → what-if simulation
- WebSocket: /ws/live-updates → positions + delay changes

Set these paths relative to NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_WS_BASE_URL.

## Getting Started (Local)
1) Install dependencies:
   - npm install
2) Create .env.local from .env.example and fill your values
3) Run the dev server:
   - npm run dev
4) Open http://localhost:3000

## Deployment
- Use Vercel “Publish” in v0 or push to GitHub and import into Vercel
- Add environment variables in Project Settings (same keys as .env.example)

## Accessibility and Performance
- Uses semantic HTML, keyboard-focusable components, and sufficient contrast
- React Query caching and request de-duplication
- Code-splitting via Next.js App Router
- Map and Gantt are dynamically imported when appropriate

## Notes
- This workspace uses Next.js App Router (not Vite). The API base variables are provided via NEXT_PUBLIC_* for client access.
- For preview in v0, .env files are not loaded—use Project Settings to define env vars. Locally, .env.local works as expected.
\`\`\`

```dotenv file=".env.example"
# Client-exposed base URL for your REST API
# Example: https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=""

# WebSocket base URL.
# Example: wss://api.yourdomain.com
# If omitted, the app may derive it from NEXT_PUBLIC_API_BASE_URL by swapping http(s) -> ws(s).
NEXT_PUBLIC_WS_BASE_URL=""

# Optional: custom tiles for Leaflet (defaults to OpenStreetMap if empty)
# Example: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_TILES_URL=""

# Optional: Mapbox access token (only if you use Mapbox GL instead of Leaflet tiles)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=""
