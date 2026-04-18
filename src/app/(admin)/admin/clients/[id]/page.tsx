"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Trash2, History, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

interface Client {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  isCorporate: boolean;
  corporateName: string | null;
  stateAbbrev: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  userId: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  status: string;
  totalPrice: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  useEffect(() => {
    if (client) {
      fetchBookings();
    }
  }, [client]);

  const fetchClient = async () => {
    try {
      const { data } = await api.get<Client>(`/clients/${clientId}`);
      setClient(data);
    } catch (err) {
      toast.error("Failed to load client");
      router.push("/admin/clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!client) return;
    try {
      // Fetch all bookings and filter by userId on client side
      const { data } = await api.get<Booking[]>("/bookings");
      const clientBookings = data.filter(b => b.userId === client.userId);
      setBookings(clientBookings);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm(`Delete ${client.displayName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${clientId}`);
      toast.success("Client deleted");
      router.push("/admin/clients");
    } catch (err) {
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/clients")}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold truncate">{client.displayName}</h2>
          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="rounded-lg border border-border p-4 mb-6 bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Phone</p>
              <p>{client.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="truncate">{client.email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Type</p>
              <p>{client.isCorporate ? "Corporate" : "Individual"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Since</p>
              <p>{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {client.notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-muted-foreground text-xs mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-4">
            <TabsTrigger value="bookings" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {bookingsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    className="w-full text-left rounded-lg border border-border p-3 bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{b.pickupLocation}</p>
                        <p className="text-xs text-muted-foreground">→ {b.dropoffLocation}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(b.pickupDate).toLocaleDateString()} at {b.pickupTime}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">${parseFloat(b.totalPrice).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === "completed" ? "bg-green-500/10 text-green-500" :
                          b.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                          "bg-blue-500/10 text-blue-500"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices">
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Invoice management coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            setClient(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

function EditClientModal({ client, onClose, onUpdated }: {
  client: Client;
  onClose: () => void;
  onUpdated: (client: Client) => void;
}) {
  const [form, setForm] = useState({
    displayName: client.displayName,
    email: client.email || "",
    phone: client.phone || "",
    isCorporate: client.isCorporate,
    corporateName: client.corporateName || "",
    stateAbbrev: client.stateAbbrev,
    notes: client.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.patch<Client>(`/clients/${client.id}`, {
        displayName: form.displayName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        isCorporate: form.isCorporate,
        corporateName: form.corporateName.trim() || null,
        stateAbbrev: form.stateAbbrev,
        notes: form.notes.trim() || null,
      });
      toast.success("Client updated");
      onUpdated(data);
    } catch (err) {
      toast.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Edit Client</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
            <span className="sr-only">Close</span>×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1">Full Name *</label>
            <Input
              placeholder="e.g. John Smith"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Phone</label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">State / Region</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.stateAbbrev}
              onChange={e => setForm(f => ({ ...f, stateAbbrev: e.target.value }))}
            >
              <option value="D">DC — District of Columbia</option>
              <option value="V">VA — Virginia</option>
              <option value="M">MD — Maryland</option>
              <option value="P">PA — Pennsylvania</option>
              <option value="W">WV — West Virginia</option>
              <option value="N">NY — New York</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Corporate Client</label>
            <input
              type="checkbox"
              checked={form.isCorporate}
              onChange={e => setForm(f => ({ ...f, isCorporate: e.target.checked }))}
              className="rounded"
            />
          </div>

          {form.isCorporate && (
            <div>
              <label className="text-xs font-medium block mb-1">Company Name</label>
              <Input
                placeholder="e.g. Acme Corp"
                value={form.corporateName}
                onChange={e => setForm(f => ({ ...f, corporateName: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium block mb-1">Notes / Memo</label>
            <textarea
              placeholder="Special preferences, instructions, etc."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
