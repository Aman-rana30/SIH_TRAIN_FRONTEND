"use client"

import { useNavigate } from "react-router-dom"

export default function Topbar() {
  const navigate = useNavigate()
  const controller = JSON.parse(localStorage.getItem("rcd_user") || '{"name":"Controller A"}')

  function logout() {
    localStorage.removeItem("rcd_token")
    localStorage.removeItem("rcd_user")
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
        <h1 className="text-pretty text-lg font-semibold text-white">Railway Controller’s Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-slate-300 md:block">
            Signed in as <span className="font-medium text-white">{controller.name}</span>
          </div>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
