"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, DollarSign } from "lucide-react";
import { notify } from "@/lib/notify";

interface PricingConfig {
  id: string;
  vehicleType: string;
  baseRate: number;
  ratePerMile: number;
  ratePerMinute: number;
  gratuityPercent: number;
  waitTimeHourly: number;
}

export default function AdminPricingPage() {
  const [configs, setConfigs] = useState<PricingConfig[]>([
    {
      id: "sedan",
      vehicleType: "sedan",
      baseRate: 30,
      ratePerMile: 4.0,
      ratePerMinute: 1.25,
      gratuityPercent: 20,
      waitTimeHourly: 95,
    },
    {
      id: "suv",
      vehicleType: "suv",
      baseRate: 37,
      ratePerMile: 4.5,
      ratePerMinute: 1.55,
      gratuityPercent: 20,
      waitTimeHourly: 95,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveConfig = async (config: PricingConfig) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/pricing/${config.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error("Failed to save");
      notify.success(`${config.vehicleType.toUpperCase()} pricing saved`);
    } catch (error) {
      notify.error("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (id: string, field: keyof PricingConfig, value: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Pricing Control Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage rates, equations & wait-time fees</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <section>
          <h3 className="text-base font-display font-semibold text-foreground mb-1">Rate Equations</h3>
          <p className="text-xs text-muted-foreground mb-4">
            y = Base + (Rate/Mile × d) + (Rate/Min × t)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-display font-semibold text-foreground capitalize">
                    Business {c.vehicleType}
                  </h4>
                  <button
                    onClick={() => saveConfig(c)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["baseRate", "Base ($)"],
                      ["ratePerMile", "$/Mile"],
                      ["ratePerMinute", "$/Minute"],
                      ["gratuityPercent", "Gratuity (%)"],
                      ["waitTimeHourly", "Wait ($/hr)"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {label}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={(c as any)[field]}
                        onChange={(e) =>
                          updateConfig(c.id, field as keyof PricingConfig, parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-muted-foreground bg-secondary/50 rounded px-2 py-1.5">
                  Formula: y = ${c.baseRate} + (${c.ratePerMile} × miles) + (${c.ratePerMinute} × mins) + {c.gratuityPercent}% gratuity
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
