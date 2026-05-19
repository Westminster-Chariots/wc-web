// Pricing calculation is now handled by usePricing hook which fetches from database
// This file only contains gatekeeper logic

export type GatekeeperStatus = "standard" | "urgent" | "emergency";

export function getGatekeeperStatus(pickupDate: string, pickupTime: string): GatekeeperStatus {
  if (!pickupDate || !pickupTime) return "standard";
  const [hours, minutes] = pickupTime.split(":").map(Number);
  const pickup = new Date(pickupDate);
  pickup.setHours(hours, minutes, 0, 0);
  const diffHours = (pickup.getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHours < 4) return "emergency";
  if (diffHours < 12) return "urgent";
  return "standard";
}
