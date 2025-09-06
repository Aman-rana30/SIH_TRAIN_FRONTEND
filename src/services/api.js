import axios from "axios"

// Prefer Vite-style env, then Next-style, then fallback to FastAPI default port
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rcd_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
