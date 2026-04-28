"use client";
import { useState, useEffect } from "react";
import { Users, Search, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get<Client[]>("/clients");
      setClients(data);
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.displayName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.corporateName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-semibold">Clients</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{clients.length} total clients</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Client</span>
        </Button>
      </header>

      <div className="p-4 md:p-8 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No clients found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" /> Add Your First Client
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(client => (
              <button
                key={client.id}
                onClick={() => router.push(`/admin/clients/${client.id}`)}
                className="w-full text-left rounded-lg border border-border p-4 hover:border-primary/30 transition-colors bg-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{client.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">{client.email || "No email"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {client.isCorporate && (
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase">
                        Corporate
                      </span>
                    )}
                    <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(client) => {
            setClients(prev => [client, ...prev]);
            setShowCreateModal(false);
            router.push(`/admin/clients/${client.id}`);
          }}
        />
      )}
    </div>
  );
}

function CreateClientModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    isCorporate: false,
    corporateName: "",
    stateAbbrev: "D",
    notes: "",
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
      const { data } = await api.post<Client>("/clients", {
        displayName: form.displayName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        isCorporate: form.isCorporate,
        corporateName: form.corporateName.trim() || null,
        stateAbbrev: form.stateAbbrev,
        notes: form.notes.trim() || null,
      });
      toast.success("Client created");
      onCreated(data);
    } catch (err) {
      toast.error("Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Add New Client</h3>
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
              {saving ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
