"use client";
import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface UrgentBannerProps {
  urgentCount: number;
}

export default function UrgentBanner({ urgentCount }: UrgentBannerProps) {
  if (urgentCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-lg border border-status-urgent/30 bg-status-urgent/10 px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-status-urgent/20 p-2 shrink-0">
          <AlertTriangle className="h-4 w-4 text-status-urgent-fg" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-status-urgent-fg font-body">
            {urgentCount} Urgent {urgentCount === 1 ? 'Booking' : 'Bookings'} — Within 12-Hour Window
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-body">
            Requires immediate dispatcher attention
          </p>
        </div>
      </div>
      <button className="flex items-center gap-2 rounded-md border border-status-urgent/30 bg-status-urgent/20 px-3 py-1.5 text-xs font-semibold text-status-urgent-fg font-body hover:bg-status-urgent/30 transition-colors w-full sm:w-auto justify-center sm:justify-start shrink-0">
        <Phone className="h-3 w-3" />
        Call Dispatch
      </button>
    </motion.div>
  );
}
