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

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

## 📱 Pages & Navigation

### Public Pages
- **Login** (`/login`): Role-based authentication

### Controller Pages
- **Dashboard** (`/dashboard`): Main control center with KPIs
- **Train Status** (`/trains`): Live train monitoring
- **Optimization** (`/optimization`): AI-powered scheduling
- **Disruptions** (`/disruptions`): Disruption management
- **Reports** (`/reports`): Analytics and reporting
- **Live Map** (`/map`): Geographic train tracking
- **Settings** (`/settings`): User preferences

### Admin Pages
- **Admin Panel** (`/admin`): System administration
- **User Management**: Controller accounts
- **Section Management**: Railway sections

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### API Integration
- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL`
- **WebSocket**: Real-time updates via `NEXT_PUBLIC_WS_URL`
- **Authentication**: JWT token-based auth

## 📊 Throughput Definition

Throughput = Number of trains successfully moved through a railway section within a given time window while minimizing delays and maximizing track capacity utilization.

**Formula**: `Throughput = (Actual Trains / Capacity) × 100%`

## 🎨 Design System

- **Colors**: Blue/Green/Red for train states and priorities
- **Theme**: Professional dark theme optimized for railway operations
- **Typography**: Clean, readable fonts for data display
- **Animations**: Railway-themed micro-interactions
- **Icons**: Lucide React iconography

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t controller-sarthi .
docker run -p 3000:3000 controller-sarthi
```

---

**ControllerSarthi** - Revolutionizing railway traffic control with AI-powered optimization and real-time monitoring.
