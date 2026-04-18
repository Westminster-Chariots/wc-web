"use client";
import { useState, useEffect, useMemo } from "react";
import { Shield, Search, Loader2, ArrowUpDown, UserCheck, Car, Mail, XCircle, CheckCircle, Clock, Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  performedBy: string | null;
  details: string | null;
  createdAt: string;
}

const actionIcons: Record<string, any> = {
  status_change: ArrowUpDown,
  driver_assigned: UserCheck,
  driver_unassigned: XCircle,
  email_sent: Mail,
  booking_created: CheckCircle,
  booking_deleted: XCircle,
  vehicle_added: Car,
  vehicle_updated: Car,
  driver_added: UserCheck,
  driver_updated: UserCheck,
  payment_link_sent: Mail,
  manifest_sent: Mail,
};

const actionColors: Record<string, string> = {
  status_change: "bg-blue-500/15 text-blue-400",
  driver_assigned: "bg-emerald-500/15 text-emerald-400",
  driver_unassigned: "bg-amber-500/15 text-amber-400",
  email_sent: "bg-purple-500/15 text-purple-400",
  booking_created: "bg-emerald-500/15 text-emerald-400",
  booking_deleted: "bg-red-500/15 text-red-400",
  vehicle_added: "bg-blue-500/15 text-blue-400",
  vehicle_updated: "bg-blue-500/15 text-blue-400",
  driver_added: "bg-emerald-500/15 text-emerald-400",
  driver_updated: "bg-amber-500/15 text-amber-400",
  payment_link_sent: "bg-purple-500/15 text-purple-400",
  manifest_sent: "bg-purple-500/15 text-purple-400",
};

const ITEMS_PER_PAGE = 50;

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      const { data } = await api.get<AuditEntry[]>("/audit");
      setEntries(data);
    } catch {
      toast.error("Failed to load audit log");
    } finally {
      setLoading(false);
    }
  };

  const actionTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.action));
    return Array.from(types).sort();
  }, [entries]);

  const entityTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.entityType));
    return Array.from(types).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterAction !== "all" && e.action !== filterAction) return false;
      if (filterEntity !== "all" && e.entityType !== filterEntity) return false;
      
      const entryDate = new Date(e.createdAt);
      if (dateFrom && entryDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (entryDate > toDate) return false;
      }
      
      if (search) {
        const s = search.toLowerCase();
        return (
          e.action.toLowerCase().includes(s) ||
          e.entityType.toLowerCase().includes(s) ||
          (e.details && e.details.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [entries, search, filterAction, filterEntity, dateFrom, dateTo]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const grouped = useMemo(() => {
    const groups: Record<string, AuditEntry[]> = {};
    paginatedEntries.forEach(e => {
      const date = new Date(e.createdAt);
      const day = date.toISOString().split("T")[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(e);
    });
    return groups;
  }, [paginatedEntries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterAction, filterEntity, dateFrom, dateTo]);

  const formatDetail = (detailsStr: string | null) => {
    if (!detailsStr) return "";
    try {
      const details = JSON.parse(detailsStr);
      const parts: string[] = [];
      if (details.reservationNumber) parts.push(details.reservationNumber);
      if (details.clientName) parts.push(details.clientName);
      if (details.driverName) parts.push(`Driver: ${details.driverName}`);
      if (details.from && details.to) parts.push(`${details.from} → ${details.to}`);
      if (details.emailPhase) parts.push(`Phase: ${details.emailPhase}`);
      if (details.emailTo) parts.push(`To: ${details.emailTo}`);
      if (details.vehicle) parts.push(details.vehicle);
      if (parts.length === 0 && Object.keys(details).length > 0) {
        return JSON.stringify(details).slice(0, 100);
      }
      return parts.join(" · ");
    } catch {
      return detailsStr.slice(0, 100);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Audit Log</h2>
          <p className="text-xs text-muted-foreground">{entries.length} total events</p>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 md:px-8 py-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              {actionTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
          >
            <option value="all">All Entities</option>
            {entityTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">From:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-[150px] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">To:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-[150px] text-sm"
            />
          </div>
          {(search || filterAction !== "all" || filterEntity !== "all" || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterAction("all");
                setFilterEntity("all");
                setDateFrom("");
                setDateTo("");
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {paginatedEntries.length} of {filtered.length} events</span>
          {totalPages > 1 && (
            <span>Page {currentPage} of {totalPages}</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 md:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0 ? "No audit events yet. Actions will be logged here automatically." : "No matching events."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, dayEntries]) => (
                <div key={date}>
                  <div className="sticky top-[73px] z-30 bg-background/90 backdrop-blur-sm py-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {formatDate(date)}
                    </p>
                  </div>

                  <div className="space-y-1 ml-2 border-l-2 border-border pl-4">
                    {dayEntries.map((entry) => {
                      const Icon = actionIcons[entry.action] || Shield;
                      const colorClass = actionColors[entry.action] || "bg-muted text-muted-foreground";

                      return (
                        <div key={entry.id} className="relative flex items-start gap-3 py-2.5">
                          <div className="absolute -left-[22px] top-3.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-border" />

                          <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold capitalize">
                                {entry.action.replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
                                {entry.entityType}
                              </span>
                            </div>
                            {entry.details && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {formatDetail(entry.details)}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {formatTime(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
