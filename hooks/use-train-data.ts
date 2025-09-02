"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const { data } = await api.get("/api/schedule/current");
      return data;
    },
    staleTime: 10_000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      // Add a trailing slash to the path here
      const { data } = await api.get("/api/metrics/");
      return data;
    },
    staleTime: 30_000,
  });
}