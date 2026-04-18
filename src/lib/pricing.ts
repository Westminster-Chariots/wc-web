export function calculatePrice(distance: number, duration: number, vehicleType: "sedan" | "suv"): number {
  if (vehicleType === "sedan") return 30 + 4.0 * distance + 1.25 * duration;
  return 37 + 4.5 * distance + 1.55 * duration;
}

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
