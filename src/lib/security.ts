// ─── XSS Protection ──────────────────────────────────────────────────────────
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// ─── Secure Storage ──────────────────────────────────────────────────────────
const STORAGE_PREFIX = "wc_";
const ENCRYPTION_KEY = "wc-secure-key"; // In production, use env variable

export const secureStorage = {
  set: (key: string, value: any) => {
    try {
      const serialized = JSON.stringify(value);
      const encoded = btoa(serialized); // Basic encoding (use crypto in production)
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encoded);
    } catch (error) {
      console.error("Storage error:", error);
    }
  },

  get: <T = any>(key: string): T | null => {
    try {
      const encoded = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!encoded) return null;
      const serialized = atob(encoded);
      return JSON.parse(serialized);
    } catch (error) {
      console.error("Storage error:", error);
      return null;
    }
  },

  remove: (key: string) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  clear: () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};

// ─── Session Management ──────────────────────────────────────────────────────
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_KEY = "last_activity";

export const sessionManager = {
  updateActivity: () => {
    secureStorage.set(ACTIVITY_KEY, Date.now());
  },

  isSessionValid: (): boolean => {
    const lastActivity = secureStorage.get<number>(ACTIVITY_KEY);
    if (!lastActivity) return false;
    return Date.now() - lastActivity < SESSION_TIMEOUT;
  },

  clearSession: () => {
    secureStorage.clear();
  },

  startActivityTracking: (onTimeout: () => void) => {
    // Update activity on user interaction
    const updateActivity = () => sessionManager.updateActivity();
    
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // Check session validity every minute
    const interval = setInterval(() => {
      if (!sessionManager.isSessionValid()) {
        onTimeout();
        clearInterval(interval);
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      clearInterval(interval);
    };
  },
};

// ─── CSRF Protection ─────────────────────────────────────────────────────────
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getCSRFToken(): string {
  let token = secureStorage.get<string>("csrf_token");
  if (!token) {
    token = generateCSRFToken();
    secureStorage.set("csrf_token", token);
  }
  return token;
}

// ─── Input Validation ────────────────────────────────────────────────────────
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

// ─── Content Security ────────────────────────────────────────────────────────
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 255);
}

export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const category = type.split("/")[0];
      return file.type.startsWith(`${category}/`);
    }
    return file.type === type;
  });
}

export function isFileSizeValid(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// ─── Rate Limiting (Client-side) ─────────────────────────────────────────────
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string) {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }
}

// Create rate limiters for different actions
export const loginRateLimiter = new ClientRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new ClientRateLimiter(100, 60 * 1000); // 100 requests per minute
