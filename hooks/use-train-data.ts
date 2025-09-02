"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      // The path should be "/schedule", not "/api/schedule"
      const { data } = await api.get("/schedule");
      return data;
    },
    staleTime: 10_000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      // The path should be "/recommendations", not "/api/recommendations"
      const { data } = await api.get("/recommendations");
      return data;
    },
    staleTime: 30_000,
  });
}