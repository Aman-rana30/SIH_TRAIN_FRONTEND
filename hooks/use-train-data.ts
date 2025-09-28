"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEffect } from "react";

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule", typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined],
    queryFn: async () => {
      // Get sectionId from localStorage
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
        : {};
      const sectionId = userData?.sectionId;
      const selectedDate = typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined
      
      if (!sectionId) {
        console.warn('No sectionId found in localStorage');
        return [];
      }
      
      const dateParam = selectedDate ? `&date=${encodeURIComponent(selectedDate)}` : ''
      const { data } = await api.get(`/api/schedule/current/refresh?section_id=${encodeURIComponent(sectionId)}${dateParam}`);
      return data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem("rcd_user"),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations", typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined],
    queryFn: async () => {
      // Add a trailing slash to the path here
      const selectedDate = typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined
      const dateParam = selectedDate ? `?date=${encodeURIComponent(selectedDate)}` : ''
      const { data } = await api.get(`/api/metrics/${dateParam}`);
      return data;
    },
    staleTime: 30_000,
  });
}

// Fetch all sections with calculated travel times so we can compute clearing time
export function useSections() {
  return useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const { data } = await api.get("/api/schedule/sections");
      return data as Array<{
        section_id: string;
        length_km: number;
        max_speed_kmh: number;
        description?: string;
        calculated_travel_time_minutes: number;
      }>;
    },
    staleTime: 60_000,
  });
}

// Hook to check for departed trains periodically
export function useDepartureChecker() {
  return useQuery({
    queryKey: ["departed-trains"],
    queryFn: async () => {
      // Get sectionId from localStorage
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
        : {};
      const sectionId = userData?.sectionId;
      
      if (!sectionId) {
        return { departed_trains: [], count: 0 };
      }
      
      const { data } = await api.get(`/api/schedule/departed?section_id=${encodeURIComponent(sectionId)}`);
      return data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem("rcd_user"),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 0,
  });
}

// Hook to get today's throughput from 00:00 to current time
export function useTodayThroughput() {
  return useQuery({
    queryKey: ["today-throughput"],
    queryFn: async () => {
      // Get sectionId from localStorage
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
        : {};
      const sectionId = userData?.sectionId;
      
      if (!sectionId) {
        return { throughput_count: 0, hours_elapsed: 0, time_range_display: "00:00–00:00" };
      }
      
      const { data } = await api.get(`/api/schedule/throughput/today?section_id=${encodeURIComponent(sectionId)}`);
      return data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem("rcd_user"),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 0,
  });
}

// Hook to get optimization data for current and optimized schedules
export function useOptimizationData() {
  return useQuery({
    queryKey: ["optimization-data", typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined],
    queryFn: async () => {
      // Get sectionId from localStorage
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
        : {};
      const sectionId = userData?.sectionId;
      const selectedDate = typeof window !== 'undefined' ? localStorage.getItem("rcd_selected_date") : undefined
      
      if (!sectionId) {
        console.warn('No sectionId found in localStorage');
        return { currentSchedule: [], optimizedSchedule: [] };
      }
      
      const dateParam = selectedDate ? `&date=${encodeURIComponent(selectedDate)}` : ''
      
      // Fetch current schedule data
      const { data: currentData } = await api.get(`/api/schedule/current/refresh?section_id=${encodeURIComponent(sectionId)}${dateParam}`);
      
      // Create current schedule (original planned times)
      const currentSchedule = (currentData || []).map((train: any) => ({
        ...train,
        // Keep original planned_time for current schedule
        planned_time: train.planned_time,
        optimized_time: train.planned_time, // For current schedule, optimized = planned
        // Ensure arrival_time is available at both levels for proper access
        arrival_time: train.train?.arrival_time || train.arrival_time || train.planned_time,
        train: {
          ...train.train,
          arrival_time: train.train?.arrival_time || train.arrival_time || train.planned_time
        }
      }));
      
      // Create optimized schedule (optimized times)
      const optimizedSchedule = (currentData || []).map((train: any) => ({
        ...train,
        // Use optimized_time for optimized schedule
        planned_time: train.planned_time, // Keep original for reference
        optimized_time: train.optimized_time,
        // Ensure arrival_time is available at both levels for proper access
        arrival_time: train.train?.arrival_time || train.arrival_time || train.planned_time,
        train: {
          ...train.train,
          arrival_time: train.train?.arrival_time || train.arrival_time || train.planned_time
        }
      }));
      
      return { currentSchedule, optimizedSchedule };
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem("rcd_user"),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}