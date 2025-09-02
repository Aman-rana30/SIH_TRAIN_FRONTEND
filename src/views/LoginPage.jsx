"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  function login(e) {
    e.preventDefault()
    localStorage.setItem("rcd_token", "mock-token")
    localStorage.setItem("rcd_user", JSON.stringify({ name: name || "Controller A" }))
    const to = location.state?.from?.pathname || "/dashboard"
    navigate(to, { replace: true })
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-slate-950 p-4">
      <motion.div className="card w-full max-w-md p-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-brand" />
          <h2 className="text-xl font-semibold">Railway Controller Login</h2>
          <p className="text-sm text-slate-400">Mock login for demo</p>
        </div>
        <form onSubmit={login} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Controller Name</label>
            <input
              className="input"
              placeholder="e.g., Alice K."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Enter Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  )
}
