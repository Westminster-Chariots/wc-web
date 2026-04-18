"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Calendar, PanelRightClose, PanelRightOpen, Download } from "lucide-react";
import { format, addMonths, subMonths, addDays, subDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useDrivers } from "@/hooks/useDrivers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDriverTimeline from "@/components/calendar/CalendarDriverTimeline";
import CalendarListView from "@/components/calendar/CalendarListView";
import DispatcherTasks from "@/components/dashboard/DispatcherTasks";

type ViewMode = "month" | "week" | "day" | "timeline" | "list";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  assigned: "bg-blue-500",
  enroute: "bg-cyan-500",
  onsite: "bg-purple-500",
  inprogress: "bg-indigo-500",
  done: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export default function AdminSchedulePage() {
  const { bookings, loading, assignDriver, unassignDriver } = useAdminBookings();
  const { drivers } = useDrivers();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [listFilter, setListFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach((b) => {
      const dateKey = b.pickupDate;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  const navigatePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === "day" || viewMode === "timeline") setCurrentDate(subDays(currentDate, 1));
  };

  const navigateNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === "day" || viewMode === "timeline") setCurrentDate(addDays(currentDate, 1));
  };

  const dateLabel = () => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    if (viewMode === "day" || viewMode === "timeline") return format(currentDate, "EEEE, MMMM d, yyyy");
    return "All Bookings";
  };

  const handleExportICS = () => {
    const upcoming = bookings.filter((b) => b.status !== "done" && b.status !== "cancelled");
    if (upcoming.length === 0) {
      notify.error("No upcoming bookings to sync");
      return;
    }
    notify.success(`Exported ${upcoming.length} bookings`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Schedule</h1>
        </div>
        <p className="text-sm text-muted-foreground">Calendar overview of all bookings</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="bg-secondary h-8">
              <TabsTrigger value="day" className="text-[10px] sm:text-xs px-2 sm:px-3">Day</TabsTrigger>
              <TabsTrigger value="timeline" className="text-[10px] sm:text-xs px-2 sm:px-3">Timeline</TabsTrigger>
              <TabsTrigger value="week" className="text-[10px] sm:text-xs px-2 sm:px-3">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-[10px] sm:text-xs px-2 sm:px-3">Month</TabsTrigger>
              <TabsTrigger value="list" className="text-[10px] sm:text-xs px-2 sm:px-3">List</TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md border border-border bg-secondary hover:bg-muted transition-colors hidden lg:flex"
            title={sidebarOpen ? "Expand calendar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelRightClose className="h-4 w-4 text-foreground" /> : <PanelRightOpen className="h-4 w-4 text-foreground" />}
          </button>
        </div>

        {viewMode !== "list" && (
          <div className="flex items-center gap-3">
            <button
              onClick={navigatePrev}
              className="p-2 rounded-md border border-border bg-secondary hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <h3 className="text-sm md:text-base font-display font-semibold text-foreground min-w-0 flex-1 text-center truncate">
              {dateLabel()}
            </h3>
            <button
              onClick={navigateNext}
              className="p-2 rounded-md border border-border bg-secondary hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs font-semibold text-primary border border-primary/30 rounded-md px-2.5 py-1.5 hover:bg-primary/10 transition-colors shrink-0"
            >
              Today
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Pending", status: "pending" },
          { label: "Assigned", status: "assigned" },
          { label: "En Route", status: "enroute" },
          { label: "On Site", status: "onsite" },
          { label: "In Progress", status: "inprogress" },
          { label: "Completed", status: "done" },
          { label: "Cancelled", status: "cancelled" },
        ].map(({ label, status }) => (
          <button
            key={status}
            onClick={() => { if (viewMode === "list") setListFilter(listFilter === status ? "all" : status); }}
            className={`flex items-center gap-1.5 ${viewMode === "list" ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className={`grid gap-6 ${sidebarOpen ? "grid-cols-1 lg:grid-cols-[1fr_280px]" : "grid-cols-1"}`}>
          <div className="overflow-x-auto">
            {viewMode === "month" && <CalendarMonthView currentMonth={currentDate} bookingsByDate={bookingsByDate} />}
            {viewMode === "week" && <CalendarWeekView selectedDate={currentDate} bookingsByDate={bookingsByDate} />}
            {viewMode === "day" && <CalendarDayView selectedDate={currentDate} bookingsByDate={bookingsByDate} />}
            {viewMode === "timeline" && <CalendarDriverTimeline selectedDate={currentDate} bookingsByDate={bookingsByDate} drivers={drivers} onAssignDriver={assignDriver} onUnassignDriver={unassignDriver} />}
            {viewMode === "list" && <CalendarListView bookings={bookings} filterStatus={listFilter} onFilterChange={setListFilter} />}
          </div>

          {sidebarOpen && (
            <div className="space-y-4 hidden lg:block">
              <DispatcherTasks />

              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="text-sm font-display font-semibold text-foreground mb-1">Google Calendar Sync</h4>
                <p className="text-xs text-muted-foreground mb-3">Export bookings to .ics file</p>
                <Button onClick={handleExportICS} className="w-full gap-2" size="sm">
                  <Download className="h-4 w-4" />
                  Export to Calendar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
