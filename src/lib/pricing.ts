// Pricing calculation is now handled by usePricing hook which fetches from database
// This file only contains gatekeeper logic

export type GatekeeperStatus = "standard" | "emergency";

export function getGatekeeperStatus(pickupDate: string, pickupTime: string): GatekeeperStatus {
  console.log('='.repeat(80));
  console.log('🔍 GATEKEEPER CALLED - Raw inputs:', { pickupDate, pickupTime });
  console.log('='.repeat(80));
  
  if (!pickupDate || !pickupTime) {
    console.log('❌ Missing date or time - returning standard');
    return "standard";
  }
  
  // Handle both 12-hour and 24-hour time formats
  let hours: number;
  let minutes: number;
  
  // Check if time includes AM/PM
  if (pickupTime.includes('AM') || pickupTime.includes('PM') || pickupTime.includes('am') || pickupTime.includes('pm')) {
    console.log('⏰ Detected 12-hour format');
    // 12-hour format: "2:30 PM"
    const timeMatch = pickupTime.match(/(\d+):(\d+)\s*(AM|PM|am|pm)/i);
    if (!timeMatch) {
      console.error('❌ Invalid time format:', pickupTime);
      return "standard";
    }
    hours = parseInt(timeMatch[1]);
    minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    console.log('⏰ Parsed 12-hour time:', { rawHours: hours, minutes, period });
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    console.log('⏰ Converted to 24-hour:', { hours, minutes });
  } else {
    console.log('⏰ Detected 24-hour format');
    // 24-hour format: "14:30"
    const timeParts = pickupTime.split(":");
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
    console.log('⏰ Parsed 24-hour time:', { hours, minutes });
  }
  
  // Parse date components to avoid timezone issues
  const [year, month, day] = pickupDate.split('-').map(Number);
  // Create date in local timezone (month is 0-indexed)
  const pickup = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  const now = new Date();
  const diffHours = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const status = diffHours < 4 ? 'emergency' : 'standard';
  
  console.log('='.repeat(80));
  console.log('🚨 GATEKEEPER RESULT:', {
    pickupDateTime: pickup.toISOString(),
    currentTime: now.toISOString(),
    diffHours: diffHours.toFixed(2),
    threshold: '4 hours',
    status: status,
    willShowAlert: status === 'emergency'
  });
  console.log('='.repeat(80));
  
  if (diffHours < 4) return "emergency";
  return "standard";
}
