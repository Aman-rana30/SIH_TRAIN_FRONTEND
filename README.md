# ControllerSarthi - AI-Powered Train Traffic Control

A comprehensive frontend application for railway traffic control and throughput optimization, built with React, Next.js, and TailwindCSS. Features role-based authentication, real-time monitoring, AI-powered optimization, and professional railway-themed design.

## 🚂 Features

### Role-Based Authentication
- **Controller Login**: Section-specific access with Section ID requirement
- **Admin Login**: Full system access for user and section management
- **Secure Routing**: Role-based page access control

### Core Modules
- **Dashboard**: Real-time KPIs, AI insights, and performance metrics
- **Train Monitoring**: Live train status, position tracking, and conflict detection
- **AI Optimization**: Schedule optimization and throughput maximization
- **Disruption Management**: Real-time alerts and AI-powered suggestions
- **Reports & Analytics**: Comprehensive performance analysis and reporting
- **Admin Panel**: User management, section configuration, and system monitoring

### Enhanced UI/UX
- **Railway-Themed Design**: Professional dark theme with railway colors
- **Real-time Notifications**: AI-powered alert system with priority levels
- **Interactive Charts**: Data visualization with Recharts
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Smooth Animations**: Framer Motion transitions and micro-interactions

## 🛠️ Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet for train tracking
- **State**: TanStack Query, React Hooks
- **Animations**: Framer Motion
- **Icons**: Lucide React

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
- `GET /api/schedule/current` → Get the current active and optimized train schedules.
- `GET /api/metrics/` → Get system performance metrics, alerts, and AI recommendations.
- `POST /api/schedule/override` → Submit a manual override from the Gantt chart.
- `POST /api/schedule/whatif` → Run a what-if disruption simulation.
- `WebSocket: /ws/updates` → Establish a WebSocket for live train position updates.

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
