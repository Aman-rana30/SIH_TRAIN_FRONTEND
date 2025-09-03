"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      // Get sectionId from localStorage
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
        : {};
      const sectionId = userData?.sectionId;
      
      if (!sectionId) {
        console.warn('No sectionId found in localStorage');
        return [];
      }
      
      const { data } = await api.get(`/api/schedule/current?section_id=${encodeURIComponent(sectionId)}`);
      return data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem("rcd_user"),
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