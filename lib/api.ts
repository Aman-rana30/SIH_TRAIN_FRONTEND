"use client"

import axios from "axios"

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  // compatibility with provided spec
  (process.env as any).VITE_API_BASE_URL ||
  ""

// When empty, axios will use relative paths like /api/schedule
const api = axios.create({
  baseURL: BASE || undefined,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rcd_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
