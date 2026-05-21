"use client";
import { Car, Clock, DollarSign, Users, TrendingUp, AlertCircle, Calendar, MapPin } from "lucide-react";
import PremiumKPICard from "@/components/dashboard/PremiumKPICard";
import PremiumBookingGrid from "@/components/dashboard/PremiumBookingGrid";
import PageTransition from "@/components/ui/PageTransition";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDrivers } from "@/hooks/useDrivers";
import { motion } from "framer-motion";

export default function PremiumDashboard() {
  const { bookings, loading: bookingsLoading, updateStatus, assignDriver } = useAdminBookings();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { drivers } = useDrivers();

  const activeRides = bookings.filter(b => ['enroute', 'onsite', 'inprogress'].includes(b.status)).length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const todayRevenue = bookings.filter(b => b.status === 'done').reduce((s, b) => s + b.price, 0);
  const urgentCount = bookings.filter(b => b.isUrgent && b.status !== 'done' && b.status !== 'cancelled').length;
  
  // Calculate trends (mock data for now)
  const trends = {
    revenue: { value: 12.5, positive: true, label: "vs yesterday" },
    bookings: { value: 8.2, positive: true, label: "week over week" },
    active: { value: -3.1, positive: false, label: "vs last hour" },
    pending: { value: 15.7, positive: true, label: "vs last day" },
  };

  const handleRefresh = () => {
    // Implement refresh logic
    console.log("Refreshing dashboard...");
  };

  const handleExport = () => {
    // Implement export logic
    console.log("Exporting data...");
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6 border border-white/[0.12] shadow-glass-elevated"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">Command Center</h1>
              <p className="text-sm text-muted-foreground font-body">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-body font-semibold text-primary">
                  {urgentCount} urgent
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-body text-muted-foreground">
                  {bookings.length} total bookings
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumKPICard 
            title="Active Rides" 
            value={activeRides} 
            subtitle="Currently in motion"
            icon={Car}
            accentColor="text-primary"
            trend={trends.active}
          />
          
          <PremiumKPICard 
            title="Pending" 
            value={pendingCount} 
            subtitle="Awaiting assignment"
            icon={Clock}
            accentColor="text-status-pending-fg"
            trend={trends.pending}
          />
          
          <PremiumKPICard 
            title="Today's Revenue" 
            value={`$${todayRevenue}`} 
            subtitle="Completed trips"
            icon={DollarSign}
            trend={trends.revenue}
          />
          
          <PremiumKPICard 
            title="Total Bookings" 
            value={bookings.length} 
            subtitle="All time"
            icon={Users}
            trend={trends.bookings}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Avg. Trip</p>
                <p className="text-lg font-display font-bold text-foreground">$87.50</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">On-Time Rate</p>
                <p className="text-lg font-display font-bold text-foreground">96.2%</p>
              </div>
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Active Drivers</p>
                <p className="text-lg font-display font-bold text-foreground">{drivers.length}</p>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-body">Fleet Available</p>
                <p className="text-lg font-display font-bold text-foreground">12/15</p>
              </div>
              <Car className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Premium Booking Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground">Live Dispatch</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Real-time management of all active and upcoming bookings
              </p>
            </div>
          </div>
          
          {bookingsLoading ? (
            <div className="glass-strong rounded-2xl p-8 border border-white/[0.12] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground font-body">Loading bookings...</p>
              </div>
            </div>
          ) : (
            <PremiumBookingGrid 
              bookings={bookings} 
              drivers={drivers} 
              onStatusChange={updateStatus} 
              onDriverAssign={assignDriver}
              onRefresh={handleRefresh}
              onExport={handleExport}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}