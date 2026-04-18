"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import BookingCard, { UIBooking, Driver } from "./BookingCard";

type BookingStatus = UIBooking["status"];

const filters: { label: string; value: BookingStatus | 'all' | 'urgent' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'En Route', value: 'enroute' },
  { label: 'Completed', value: 'done' },
];

interface BookingGridProps {
  bookings: UIBooking[];
  drivers?: Driver[];
  onStatusChange?: (bookingId: string, newStatus: UIBooking["status"]) => void;
  onDriverAssign?: (bookingId: string, driverId: string | null) => void;
}

export default function BookingGrid({ bookings, drivers = [], onStatusChange, onDriverAssign }: BookingGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = bookings.filter(b => {
    if (activeFilter === 'urgent') return b.isUrgent && b.status !== 'done';
    if (activeFilter !== 'all') return b.status === activeFilter;
    return true;
  }).filter(b =>
    searchQuery === '' ||
    b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by groupId
  const grouped = filtered.reduce<Record<string, UIBooking[]>>((acc, b) => {
    const key = b.groupId || b.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search client or reservation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary pl-10 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold font-body transition-all cursor-pointer ${
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([groupKey, groupBookings]) => (
          <div key={groupKey}>
            {groupBookings.length > 1 && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-px flex-1 bg-primary/20" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-body font-semibold">
                  Multi-Leg • {groupBookings.length} Trips • Total ${groupBookings.reduce((s, b) => s + b.price, 0)}
                </span>
                <div className="h-px flex-1 bg-primary/20" />
              </div>
            )}
            <div className="space-y-2">
              {groupBookings.map((booking, i) => (
                <BookingCard key={booking.id} booking={booking} index={i} drivers={drivers} onStatusChange={onStatusChange} onDriverAssign={onDriverAssign} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <p className="text-lg font-display text-muted-foreground italic">
            Awaiting the next Chariot request...
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-body">
            No bookings match your current filters
          </p>
        </motion.div>
      )}
    </div>
  );
}
