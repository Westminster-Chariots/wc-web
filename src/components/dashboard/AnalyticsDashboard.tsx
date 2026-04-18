"use client";
import { DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  activeBookings: number;
  completedToday: number;
  averageBookingValue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  topRoutes: Array<{ route: string; count: number }>;
}

interface AnalyticsDashboardProps {
  analytics?: AnalyticsData;
  loading?: boolean;
}

export default function AnalyticsDashboard({ analytics, loading }: AnalyticsDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-xl border border-white/[0.06] animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      label: 'Active Bookings',
      value: analytics.activeBookings,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      label: 'Completed Today',
      value: analytics.completedToday,
      icon: CheckCircle,
      color: 'text-primary',
    },
    {
      label: 'Avg Booking Value',
      value: `$${Math.round(analytics.averageBookingValue)}`,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-6 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="glass p-6 rounded-xl border border-white/[0.06]">
        <h3 className="text-lg font-display font-semibold mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-body">Today</p>
            <p className="text-xl font-display font-bold text-foreground">
              ${analytics.revenueToday.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-body">This Week</p>
            <p className="text-xl font-display font-bold text-foreground">
              ${analytics.revenueThisWeek.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-body">This Month</p>
            <p className="text-xl font-display font-bold text-foreground">
              ${analytics.revenueThisMonth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="glass p-6 rounded-xl border border-white/[0.06]">
        <h3 className="text-lg font-display font-semibold mb-4">Top Routes</h3>
        <div className="space-y-3">
          {analytics.topRoutes.map((route, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="text-sm font-body text-foreground">{route.route}</p>
              <span className="text-sm font-body text-muted-foreground">
                {route.count} bookings
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
