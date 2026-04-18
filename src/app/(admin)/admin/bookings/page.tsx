"use client";
import PageTransition from "@/components/ui/PageTransition";
import { FileText } from "lucide-react";

export default function BookingsPage() {
  return (
    <PageTransition>
      <div className="p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Bookings</h1>
        </div>
        <div className="glass p-12 rounded-xl border border-white/[0.06] text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-lg font-display text-muted-foreground mb-2">Bookings Management Coming Soon</p>
          <p className="text-sm text-muted-foreground font-body">
            Detailed booking list and management features will be available here.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
