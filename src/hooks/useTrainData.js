import { useQuery } from "@tanstack/react-query"
import api from "../services/api"

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const sectionId = JSON.parse(localStorage.getItem("rcd_user") || "{}")?.sectionId
      const url = sectionId
        ? `/api/schedule/current/refresh?section_id=${encodeURIComponent(sectionId)}`
        : `/api/schedule/current/refresh`
      const { data } = await api.get(url)
      return data
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
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
