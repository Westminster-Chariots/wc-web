import { cn } from "@/lib/utils";

type UIBookingStatus = "pending" | "assigned" | "enroute" | "onsite" | "inprogress" | "done" | "cancelled";

const STATUS_CONFIG: Record<UIBookingStatus, { label: string; classes: string }> = {
  pending:     { label: "Pending",     classes: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  assigned:    { label: "Assigned",    classes: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  enroute:     { label: "En Route",    classes: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  onsite:      { label: "On Site",     classes: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  inprogress:  { label: "In Progress", classes: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  done:        { label: "Completed",   classes: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  cancelled:   { label: "Cancelled",   classes: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function StatusBadge({ status, className }: { status: UIBookingStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border font-body font-semibold uppercase tracking-wider", cfg.classes, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export default StatusBadge;
