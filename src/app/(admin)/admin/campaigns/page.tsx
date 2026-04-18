"use client";
import { useState, useEffect } from "react";
import { Mail, Send, Users, Filter, Eye, Loader2, CheckCircle2, UserPlus, Calendar, Star, Building2, AlertCircle, ChevronDown, Clock, History, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";

type AudienceFilter = "all" | "first_time" | "repeat" | "corporate" | "inactive" | "recent";

interface Campaign {
  id: string;
  subject: string;
  audience: string;
  recipientCount: number;
  sentCount: number | null;
  failedCount: number | null;
  status: string;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

const audienceOptions = [
  { value: "all", label: "All Clients", icon: Users, description: "Send to every registered client" },
  { value: "first_time", label: "First-Time Riders", icon: UserPlus, description: "Clients who have only 1 booking" },
  { value: "repeat", label: "Repeat Clients", icon: Star, description: "Clients with 3+ bookings" },
  { value: "corporate", label: "Corporate Accounts", icon: Building2, description: "Clients flagged as corporate" },
  { value: "inactive", label: "Inactive (60+ days)", icon: Calendar, description: "No bookings in the last 60 days" },
  { value: "recent", label: "Recent Riders (7 days)", icon: CheckCircle2, description: "Had a ride within the past week" },
];

const templates = [
  {
    id: "airport",
    name: "Airport Transfers",
    subject: "Elevate Your Airport Transfers with Westminster Chariots",
    heading: "Take flights, not chances",
    body: "Air travel can be stressful, but not with a Westminster Chariots airport transfer!\n\n✈️ Flight tracking — Enter your flight number when booking, and your chauffeur will track it.\n\n📍 Personalized pickup — Your chauffeur will be waiting with a personalized pickup sign.\n\n🛎️ Special requests — Need a child seat or extra luggage space? Just let us know.\n\n🚐 Large vehicles available — Book our Business SUV with room for 6 pieces of luggage.",
  },
  {
    id: "welcome_back",
    name: "Welcome Back",
    subject: "We've Missed You — Here's Something Special",
    heading: "It's been a while",
    body: "We noticed it's been some time since your last ride with Westminster Chariots. We'd love to welcome you back.\n\nAs a valued client, we want to make your next journey unforgettable. Book your next ride and experience the luxury you deserve.\n\n✨ Premium vehicles\n🕐 On-time, every time\n💎 White-glove service",
  },
  {
    id: "corporate",
    name: "Corporate Program",
    subject: "Streamline Your Business Travel with Westminster Chariots",
    heading: "Luxury travel for your team",
    body: "Simplify your company's ground transportation with our corporate program.\n\n📊 Consolidated monthly invoicing\n🔐 Dedicated account management\n📱 Easy online booking portal\n🎯 Priority scheduling for your executives\n\nContact us to set up your corporate account and receive preferred pricing.",
  },
  { id: "custom", name: "Custom Email", subject: "", heading: "", body: "" },
];

export default function CampaignsPage() {
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [template, setTemplate] = useState("airport");
  const [subject, setSubject] = useState(templates[0].subject);
  const [heading, setHeading] = useState(templates[0].heading);
  const [body, setBody] = useState(templates[0].body);
  const [ctaText, setCtaText] = useState("Book Now");
  const [ctaUrl, setCtaUrl] = useState("https://westminsterchariots.com/book");
  const [sendMode, setSendMode] = useState<"now" | "scheduled">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; scheduled?: boolean } | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    fetchRecipientCount();
  }, [audience]);

  useEffect(() => {
    const t = templates.find(o => o.id === template);
    if (t && t.id !== "custom") {
      setSubject(t.subject);
      setHeading(t.heading);
      setBody(t.body);
    }
  }, [template]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchRecipientCount = async () => {
    setLoadingCount(true);
    try {
      const { data } = await api.get<{ count: number }>(`/campaigns/count?audience=${audience}`);
      setRecipientCount(data.count);
    } catch {
      setRecipientCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get<Campaign[]>("/campaigns");
      setCampaigns(data);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendResult(null);

    const scheduledFor = sendMode === "scheduled" && scheduleDate
      ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
      : null;

    try {
      const { data } = await api.post<{ sent?: number; failed?: number; scheduled?: boolean }>("/campaigns/send", {
        audience,
        subject,
        heading,
        body,
        ctaText,
        ctaUrl,
        scheduledFor,
      });

      if (scheduledFor) {
        setSendResult({ sent: 0, failed: 0, scheduled: true });
        toast.success("Campaign scheduled successfully");
      } else {
        setSendResult({ sent: data.sent ?? 0, failed: data.failed ?? 0 });
        toast.success(`${data.sent ?? 0} emails sent successfully`);
      }
      fetchHistory();
    } catch {
      toast.error("Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/campaigns/${id}/cancel`);
      toast.success("Campaign cancelled");
      fetchHistory();
    } catch {
      toast.error("Failed to cancel campaign");
    }
  };

  const selectedAudience = audienceOptions.find(o => o.value === audience)!;
  const canSend = subject && heading && body && recipientCount !== 0;
  const canSchedule = canSend && (sendMode === "now" || scheduleDate);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4">
        <h2 className="text-lg md:text-xl font-semibold">Email Campaigns</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Send or schedule promotional emails</p>
      </header>

      <div className="p-4 md:p-8">
        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList>
            <TabsTrigger value="compose" className="gap-1.5">
              <Mail className="h-4 w-4" /> Compose
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" /> History
              {campaigns.length > 0 && (
                <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 rounded">{campaigns.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column — Compose */}
              <div className="lg:col-span-2 space-y-6">
                {/* Audience Filter */}
                <div className="rounded-lg border border-border bg-card">
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Audience</span>
                      {recipientCount !== null && (
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {loadingCount ? "..." : recipientCount} recipients
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                  </button>
                  {filtersOpen && (
                    <div className="p-4 pt-0">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {audienceOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAudience(opt.value as AudienceFilter)}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                              audience === opt.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <opt.icon className={`h-5 w-5 mt-0.5 shrink-0 ${audience === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                            <div>
                              <p className={`text-sm font-medium ${audience === opt.value ? "text-primary" : ""}`}>{opt.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compose */}
                <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Compose Email</span>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Template</label>
                    <select
                      value={template}
                      onChange={e => setTemplate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Subject Line</label>
                    <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Heading</label>
                    <Input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Main heading..." />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Body Content</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="Email body..."
                      rows={8}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Use line breaks for paragraphs. Emojis supported.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">CTA Button Text</label>
                      <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Book Now" />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">CTA Link URL</label>
                      <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column — Actions */}
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Send className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sending to <span className="text-foreground font-semibold">{selectedAudience.label}</span>
                    </p>
                    <p className="text-3xl font-bold">
                      {loadingCount ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (recipientCount ?? "—")}
                    </p>
                    <p className="text-xs text-muted-foreground">recipients</p>
                  </div>

                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setSendMode("now")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm transition-colors ${
                        sendMode === "now" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" /> Send Now
                    </button>
                    <button
                      onClick={() => setSendMode("scheduled")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm transition-colors border-l border-border ${
                        sendMode === "scheduled" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" /> Schedule
                    </button>
                  </div>

                  {sendMode === "scheduled" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium block mb-1">Date</label>
                        <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1">Time</label>
                        <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4" /> Preview Email
                  </Button>

                  <Button
                    className="w-full gap-2"
                    onClick={() => setShowConfirm(true)}
                    disabled={sending || !canSchedule}
                  >
                    {sending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {sendMode === "scheduled" ? "Scheduling..." : "Sending..."}</>
                    ) : sendMode === "scheduled" ? (
                      <><Clock className="h-4 w-4" /> Schedule Campaign</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Campaign</>
                    )}
                  </Button>

                  {!canSend && (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Fill in all fields before sending
                    </p>
                  )}
                </div>

                {sendResult && (
                  <div className={`rounded-lg border p-6 text-center ${sendResult.scheduled ? "border-blue-500/30 bg-blue-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
                    {sendResult.scheduled ? (
                      <>
                        <Clock className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                        <p className="text-lg font-bold">Scheduled</p>
                        <p className="text-xs text-muted-foreground">Campaign will be sent automatically</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                        <p className="text-lg font-bold">{sendResult.sent} Sent</p>
                        {sendResult.failed > 0 && <p className="text-xs text-red-400">{sendResult.failed} failed</p>}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded-lg border border-border bg-card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Campaign History</span>
                </div>
              </div>
              <div className="p-4">
                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">No campaigns sent yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2">Subject</th>
                          <th className="text-left py-2 px-2">Audience</th>
                          <th className="text-center py-2 px-2">Recipients</th>
                          <th className="text-center py-2 px-2">Sent</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Date</th>
                          <th className="py-2 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id} className="border-b border-border">
                            <td className="py-2 px-2 max-w-[200px] truncate">{c.subject}</td>
                            <td className="py-2 px-2">
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                                {audienceOptions.find(o => o.value === c.audience)?.label ?? c.audience}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">{c.recipientCount}</td>
                            <td className="py-2 px-2 text-center">
                              {c.sentCount ?? 0}
                              {c.failedCount && c.failedCount > 0 && <span className="text-red-400 ml-1">/ {c.failedCount} ✗</span>}
                            </td>
                            <td className="py-2 px-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                c.status === "sent" ? "bg-emerald-500/20 text-emerald-400" :
                                c.status === "scheduled" ? "bg-blue-500/20 text-blue-400" :
                                c.status === "cancelled" ? "bg-muted text-muted-foreground" :
                                "bg-amber-500/20 text-amber-400"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-xs text-muted-foreground whitespace-nowrap">
                              {c.status === "scheduled" && c.scheduledFor
                                ? new Date(c.scheduledFor).toLocaleString()
                                : c.sentAt
                                ? new Date(c.sentAt).toLocaleString()
                                : new Date(c.createdAt).toLocaleString()}
                            </td>
                            <td className="py-2 px-2">
                              {c.status === "scheduled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-destructive hover:text-destructive gap-1 text-xs"
                                  onClick={() => handleCancel(c.id)}
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold">Email Preview</h3>
                <p className="text-xs text-muted-foreground">Subject: {subject}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-muted rounded-md">×</button>
            </div>
            <div className="p-4 bg-white" dangerouslySetInnerHTML={{ __html: buildPreviewHtml(heading, body, ctaText, ctaUrl) }} />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-2">
              {sendMode === "scheduled" ? "Schedule Campaign?" : "Send Campaign?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will {sendMode === "scheduled" ? "schedule" : "send"} "{subject}" to{" "}
              <span className="text-primary font-semibold">{recipientCount}</span> {selectedAudience.label.toLowerCase()}.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={handleSend}>
                {sendMode === "scheduled" ? <><Clock className="h-4 w-4 mr-1" /> Schedule</> : <><Send className="h-4 w-4 mr-1" /> Send</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildPreviewHtml(heading: string, body: string, ctaText: string, ctaUrl: string): string {
  const paragraphs = body
    .split("\n")
    .filter(l => l.trim())
    .map(l => `<p style="margin:0 0 12px;color:#333;font-size:15px;line-height:1.6;">${l}</p>`)
    .join("");

  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#1a1a1a;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#c8a45e;font-size:22px;letter-spacing:3px;font-weight:700;">WESTMINSTER CHARIOTS</h1>
        <p style="margin:6px 0 0;color:#999;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Travel in Luxury · Arrive in Style</p>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:24px;font-weight:700;">${heading}</h2>
        <div style="width:50px;height:3px;background:#c8a45e;margin:0 0 24px;border-radius:2px;"></div>
        ${paragraphs}
        <div style="text-align:center;margin:32px 0 16px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#c8a45e;color:#fff;padding:14px 40px;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.5px;">${ctaText}</a>
        </div>
      </div>
      <div style="background:#f5f5f5;padding:24px 32px;text-align:center;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px;color:#999;font-size:11px;">Westminster Chariots · Washington, DC</p>
        <p style="margin:0;color:#bbb;font-size:10px;">You received this because you're a valued client.</p>
      </div>
    </div>
  `;
}
