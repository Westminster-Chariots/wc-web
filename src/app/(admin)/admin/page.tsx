"use client";
import { Car, Clock, DollarSign, Users } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import UrgentBanner from "@/components/dashboard/UrgentBanner";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import BookingGrid from "@/components/dashboard/BookingGrid";
import PageTransition from "@/components/ui/PageTransition";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDrivers } from "@/hooks/useDrivers";

export default function AdminDashboard() {
  const { bookings, loading: bookingsLoading, updateStatus, assignDriver } = useAdminBookings();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { drivers } = useDrivers();

  const activeRides = bookings.filter(b => ['enroute', 'onsite', 'inprogress'].includes(b.status)).length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const todayRevenue = bookings.filter(b => b.status === 'done').reduce((s, b) => s + b.price, 0);
  const urgentCount = bookings.filter(b => b.isUrgent && b.status !== 'done' && b.status !== 'cancelled').length;

  return (
    <PageTransition>
      <div className="p-4 md:p-8 space-y-6">
        {/* Urgent Banner */}
        <UrgentBanner urgentCount={urgentCount} />

        {/* Analytics Dashboard */}
        <AnalyticsDashboard analytics={analytics || undefined} loading={analyticsLoading} />

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Active Rides" value={activeRides} subtitle="Currently in motion" icon={Car} accentColor="text-primary" />
          <KPICard title="Pending" value={pendingCount} subtitle="Awaiting assignment" icon={Clock} accentColor="text-status-pending-fg" />
          <KPICard title="Today's Revenue" value={`$${todayRevenue}`} subtitle="Completed trips" icon={DollarSign} />
          <KPICard title="Total Bookings" value={bookings.length} subtitle="All time" icon={Users} />
        </div>

        {/* Booking Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-foreground">Dispatch Grid</h3>
            <p className="text-xs text-muted-foreground font-body">
              {bookings.length} total bookings
            </p>
          </div>
          {bookingsLoading ? (
            <div className="glass p-6 rounded-xl border border-white/[0.06]">
              <p className="text-sm text-muted-foreground font-body text-center py-8">Loading bookings...</p>
            </div>
          ) : (
            <BookingGrid bookings={bookings} drivers={drivers} onStatusChange={updateStatus} onDriverAssign={assignDriver} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
