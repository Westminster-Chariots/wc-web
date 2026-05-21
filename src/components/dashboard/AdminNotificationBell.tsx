"use client";
import { useState, useEffect, useCallback } from "react";
import { Bell, X, Car, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: "new_booking" | "cancellation" | "status_change";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  bookingId?: string;
}

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // TODO: Subscribe to realtime booking changes via Pusher
  useEffect(() => {
    // Placeholder for Pusher integration
    // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // });
    // const channel = pusher.subscribe('admin-notifications');
    // channel.bind('new-booking', (data: any) => {
    //   addNotification({
    //     type: "new_booking",
    //     title: "New Booking",
    //     description: `${data.clientName} — ${data.pickup} → ${data.dropoff}`,
    //     bookingId: data.id,
    //   });
    // });
    // return () => {
    //   pusher.unsubscribe('admin-notifications');
    // };
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    setNotifications((prev) => [
      {
        ...n,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ].slice(0, 50)); // Keep max 50
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const iconByType = {
    new_booking: Car,
    cancellation: XCircle,
    status_change: Clock,
  };

  const colorByType = {
    new_booking: "text-emerald-400 bg-emerald-500/10",
    cancellation: "text-red-400 bg-red-500/10",
    status_change: "text-blue-400 bg-blue-500/10",
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) markAllRead(); }}>
      <PopoverTrigger asChild>
        <button className="relative rounded-md border border-border bg-secondary p-2 hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-background/75 backdrop-blur-xl border border-white/[0.12] shadow-xl" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-display font-semibold text-foreground">Notifications</h3>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground font-body">
              Clear all
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground font-body">No notifications yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">New bookings and cancellations will appear here in real-time.</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n) => {
                const Icon = iconByType[n.type];
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.08] hover:bg-white/5 transition-colors ${!n.read ? "bg-primary/10" : ""}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorByType[n.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground font-body">{n.title}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(n.timestamp, "h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
