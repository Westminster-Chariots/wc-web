"use client";
import { useState, useEffect } from "react";
import { analyticsService } from "@/lib/services";

export interface AnalyticsData {
  totalRevenue: number;
  activeBookings: number;
  completedToday: number;
  averageBookingValue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  topRoutes: Array<{ route: string; count: number }>;
}

// Fallback data when API is not available
const FALLBACK_DATA: AnalyticsData = {
  totalRevenue: 0,
  activeBookings: 0,
  completedToday: 0,
  averageBookingValue: 0,
  revenueToday: 0,
  revenueThisWeek: 0,
  revenueThisMonth: 0,
  topRoutes: [
    { route: 'DCA → Downtown DC', count: 0 },
    { route: 'IAD → Arlington', count: 0 },
    { route: 'Pentagon → Capitol Hill', count: 0 },
    { route: 'Tysons → Georgetown', count: 0 },
  ],
};

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboard();
        setAnalytics(data);
      } catch (error: any) {
        // Silently use fallback data if endpoint doesn't exist yet
        console.warn("Analytics endpoint not available, using fallback data");
        setAnalytics(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading };
}
