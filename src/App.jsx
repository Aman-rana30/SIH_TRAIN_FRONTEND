"use client"

import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import LoginPage from "./views/LoginPage"
import DashboardView from "./views/DashboardView"
import GanttChartView from "./views/GanttChartView"
import MapView from "./views/MapView"
import SettingsView from "./views/SettingsView"

function useAuth() {
  const token = localStorage.getItem("rcd_token")
  return !!token
}

function Protected({ children }) {
  const authed = useAuth()
  const location = useLocation()
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export default function App() {
  const navigate = useNavigate()
  useEffect(() => {
    // redirect root to dashboard if authed
    if (location.pathname === "/") {
      navigate("/dashboard", { replace: true })
    }
  }, [])

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <Protected>
              <div className="flex w-full">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Topbar />
                  <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
                    <Routes>
                      <Route path="dashboard" element={<DashboardView />} />
                      <Route path="gantt" element={<GanttChartView />} />
                      <Route path="map" element={<MapView />} />
                      <Route path="settings" element={<SettingsView />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </Protected>
          }
        />
      </Routes>
    </div>
  )
}
