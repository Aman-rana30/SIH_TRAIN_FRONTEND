import { useQuery } from "@tanstack/react-query"
import api from "../services/api"

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const { data } = await api.get("/api/schedule")
      return data
    },
    staleTime: 10_000,
  })
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const { data } = await api.get("/api/recommendations")
      return data
    },
    staleTime: 30_000,
  })
}
