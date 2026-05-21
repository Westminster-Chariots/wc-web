"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Filter, Download, RefreshCw } from "lucide-react";
import PremiumBookingCard from "./PremiumBookingCard";
import type { UIBooking, Driver } from "./BookingCard";
import { Button } from "@/components/ui/button";

type BookingStatus = UIBooking["status"];

const filters: { label: string; value: BookingStatus | 'all' | 'urgent'; count?: number }[] = [
  { label: 'All', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'En Route', value: 'enroute' },
  { label: 'Completed', value: 'done' },
];

interface PremiumBookingGridProps {
  bookings: UIBooking[];
  drivers?: Driver[];
  onStatusChange?: (bookingId: string, newStatus: UIBooking["status"]) => void;
  onDriverAssign?: (bookingId: string, driverId: string | null) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

const ITEMS_PER_PAGE = 8;

export default function PremiumBookingGrid({ 
  bookings, 
  drivers = [], 
  onStatusChange, 
  onDriverAssign,
  onRefresh,
  onExport 
}: PremiumBookingGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (activeFilter === 'urgent') return b.isUrgent && b.status !== 'done';
      if (activeFilter !== 'all') return b.status === activeFilter;
      return true;
    }).filter(b => {
      if (searchQuery === '') return true;
      
      const query = searchQuery.toLowerCase();
      
      // Search across all relevant fields
      return (
        b.clientName?.toLowerCase().includes(query) ||
        b.clientEmail?.toLowerCase().includes(query) ||
        b.clientPhone?.toLowerCase().includes(query) ||
        b.reservationNumber?.toLowerCase().includes(query) ||
        b.pickupLocation?.toLowerCase().includes(query) ||
        b.dropoffLocation?.toLowerCase().includes(query) ||
        b.pickupDate?.toLowerCase().includes(query) ||
        b.pickupTime?.toLowerCase().includes(query) ||
        b.vehicleType?.toLowerCase().includes(query) ||
        b.vehicleNumber?.toLowerCase().includes(query) ||
        b.driverName?.toLowerCase().includes(query) ||
        b.flightTail?.toLowerCase().includes(query) ||
        b.specialRequests?.toLowerCase().includes(query) ||
        b.notes?.toLowerCase().includes(query) ||
        b.status?.toLowerCase().includes(query) ||
        b.clientCode?.toLowerCase().includes(query)
      );
    });
  }, [bookings, activeFilter, searchQuery]);

  // Reset to page 0 when filters change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(0);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  // Group by groupId
  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, UIBooking[]>>((acc, b) => {
      const key = b.groupId || b.id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    }, {});
  }, [filtered]);

  const groupedEntries = Object.entries(grouped);
  const totalPages = Math.ceil(groupedEntries.length / ITEMS_PER_PAGE);
  const paginatedGroups = groupedEntries.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: bookings.length,
      urgent: bookings.filter(b => b.isUrgent && b.status !== 'done').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      assigned: bookings.filter(b => b.status === 'assigned').length,
      enroute: bookings.filter(b => b.status === 'enroute').length,
      done: bookings.filter(b => b.status === 'done').length,
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Premium Toolbar */}
      <div className="glass-strong rounded-2xl p-5 border border-white/[0.12] shadow-glass-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-display font-semibold text-foreground">Dispatch Grid</h3>
            <p className="text-sm text-muted-foreground font-body">
              Manage and monitor all bookings in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2 border-border hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 border-border hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-6">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookings by name, email, phone, address, reservation #..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-body text-muted-foreground">Filters</span>
            </div>
            <div className="text-sm text-muted-foreground font-body">
              {filtered.length} of {bookings.length} bookings
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-4 mt-4 border-t border-border/50">
          {filters.map(f => {
            const count = filterCounts[f.value as keyof typeof filterCounts] || 0;
            return (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold font-body transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeFilter === f.value
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-primary/30 hover:bg-secondary/30'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Premium Grid */}
      <div className="space-y-4">
        {paginatedGroups.map(([groupKey, groupBookings]) => (
          <div key={groupKey}>
            {groupBookings.length > 1 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Multi-Leg Journey
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {groupBookings.length} trips
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-primary">
                    Total ${groupBookings.reduce((s, b) => s + b.price, 0)}
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            )}
            <div className="space-y-3">
              {groupBookings.map((booking, i) => (
                <PremiumBookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={i} 
                  drivers={drivers} 
                  onStatusChange={onStatusChange} 
                  onDriverAssign={onDriverAssign} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center glass-strong rounded-2xl border border-white/[0.12]"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
            <div className="relative h-16 w-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary/60" />
            </div>
          </div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-2">
            No bookings found
          </h4>
          <p className="text-sm text-muted-foreground font-body max-w-md">
            {searchQuery 
              ? `No bookings match "${searchQuery}". Try a different search term.`
              : `No bookings match your current filters. Try selecting a different filter.`
            }
          </p>
        </motion.div>
      )}

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <div className="glass-strong rounded-2xl p-5 border border-white/[0.12] shadow-glass-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-body">
                Page {currentPage + 1} of {totalPages}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Showing {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, groupedEntries.length)} of {groupedEntries.length} bookings
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="gap-2 border-border hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageIndex = i;
                  if (totalPages > 5) {
                    if (currentPage < 2) pageIndex = i;
                    else if (currentPage > totalPages - 3) pageIndex = totalPages - 5 + i;
                    else pageIndex = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageIndex}
                      onClick={() => setCurrentPage(pageIndex)}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all border ${
                        currentPage === pageIndex
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'text-muted-foreground border-border hover:text-foreground hover:border-primary/30 hover:bg-secondary/30'
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="gap-2 border-border hover:bg-secondary"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}