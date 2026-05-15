"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, DollarSign, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pricingService } from "@/lib/services";

interface PricingConfig {
  id: string;
  vehicleType: string;
  baseRate: number;
  ratePerMile: number;
  ratePerMinute: number;
  gratuityPercent: number;
  waitTimeHourly: number;
}

interface FlatZone {
  id: string;
  name: string;
  code: string;
  sedanPrice: number;
  suvPrice: number;
  radiusMiles: number;
  isActive: boolean;
}

export default function AdminPricingPage() {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [zones, setZones] = useState<FlatZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [configData, zoneData] = await Promise.all([
        pricingService.getConfig(),
        pricingService.getZones()
      ]);
      
      // Convert numeric strings to numbers
      const parsedConfigs = configData.map((c: any) => ({
        ...c,
        baseRate: parseFloat(c.baseRate),
        ratePerMile: parseFloat(c.ratePerMile),
        ratePerMinute: parseFloat(c.ratePerMinute),
        gratuityPercent: parseFloat(c.gratuityPercent),
        waitTimeHourly: parseFloat(c.waitTimeHourly),
      }));
      
      const parsedZones = zoneData.map((z: any) => ({
        ...z,
        sedanPrice: parseFloat(z.sedanPrice),
        suvPrice: parseFloat(z.suvPrice),
        radiusMiles: parseFloat(z.radiusMiles),
      }));
      
      setConfigs(parsedConfigs);
      setZones(parsedZones);
    } catch (error: any) {
      toast.error(error.message || "Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: PricingConfig) => {
    setSaving(true);
    try {
      await pricingService.updateConfig(config.id, {
        baseRate: config.baseRate,
        ratePerMile: config.ratePerMile,
        ratePerMinute: config.ratePerMinute,
        gratuityPercent: config.gratuityPercent,
        waitTimeHourly: config.waitTimeHourly,
      });
      toast.success(`${config.vehicleType.toUpperCase()} pricing saved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const saveZone = async (zone: FlatZone) => {
    setSaving(true);
    try {
      await pricingService.updateZone(zone.id, {
        sedanPrice: zone.sedanPrice,
        suvPrice: zone.suvPrice,
        radiusMiles: zone.radiusMiles,
        isActive: zone.isActive,
      });
      toast.success(`${zone.name} zone saved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save zone");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (id: string, field: keyof PricingConfig, value: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const updateZone = (id: string, field: keyof FlatZone, value: number | boolean) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Pricing Control Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage rates, equations & flat-rate zones</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Rate Equations */}
          <section>
            <h3 className="text-base font-display font-semibold text-foreground mb-1">Rate Equations</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Price = Base + (Rate/Mile × distance) + (Rate/Min × duration)
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
                    Formula: ${c.baseRate} + (${c.ratePerMile} × miles) + (${c.ratePerMinute} × mins) + {c.gratuityPercent}% gratuity
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Flat Rate Zones */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-semibold text-foreground mb-1">Flat Rate Zones</h3>
                <p className="text-xs text-muted-foreground">
                  Airport and special location flat rates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div key={zone.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-display font-semibold text-foreground">
                        {zone.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">{zone.code}</p>
                    </div>
                    <button
                      onClick={() => saveZone(zone)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Sedan Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.sedanPrice}
                        onChange={(e) =>
                          updateZone(zone.id, "sedanPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        SUV Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.suvPrice}
                        onChange={(e) =>
                          updateZone(zone.id, "suvPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Radius (miles)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={zone.radiusMiles}
                        onChange={(e) =>
                          updateZone(zone.id, "radiusMiles", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={zone.isActive}
                        onChange={(e) => updateZone(zone.id, "isActive", e.target.checked)}
                        className="h-4 w-4 text-primary"
                      />
                      <label className="text-xs text-foreground">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
