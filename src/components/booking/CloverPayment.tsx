"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloverPaymentProps {
  amount: number;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

// Clover Hosted iFrame SDK types (minimal surface used here).
// The SDK is loaded from Clover's own domain at runtime - see SDK_URL below.
// Reference: https://docs.clover.com/dev/docs/using-the-clover-hosted-iframe
interface CloverElement {
  mount: (selector: string) => void;
  unmount?: () => void;
  addEventListener: (event: string, handler: (e: CloverFieldEvent) => void) => void;
}
interface CloverFieldEvent {
  error?: { message?: string } | null;
  touched?: boolean;
  empty?: boolean;
}
interface CloverElements {
  create: (type: string, styles?: Record<string, Record<string, string>>) => CloverElement;
}
interface CloverInstance {
  elements: () => CloverElements;
  createToken: () => Promise<{ token?: string; errors?: Record<string, string> }>;
}
declare global {
  interface Window {
    Clover?: new (apiAccessKey: string, opts: { merchantId: string }) => CloverInstance;
  }
}

const CLOVER_SDK_URL =
  process.env.NEXT_PUBLIC_CLOVER_ENVIRONMENT === "production"
    ? "https://checkout.clover.com/sdk.js"
    : "https://checkout.sandbox.dev.clover.com/sdk.js";

// Generous but finite - a hung script/mount/tokenize should surface as a
// recoverable error, never spin forever (this is the exact bug we hit: a
// stale closure could suppress the "ready" transition while the elements had
// actually already mounted underneath, leaving the button disabled forever).
const SDK_LOAD_TIMEOUT_MS = 15_000;
const TOKENIZE_TIMEOUT_MS = 20_000;

// Field element definitions: Clover-hosted, so raw values never enter our JS.
const FIELD_DEFS = [
  { key: "cardName", type: "CARD_NAME", mountId: "clover-card-name", label: "Cardholder name" },
  { key: "cardNumber", type: "CARD_NUMBER", mountId: "clover-card-number", label: "Card number" },
  { key: "cardDate", type: "CARD_DATE", mountId: "clover-card-date", label: "Expiration date" },
  { key: "cardCvv", type: "CARD_CVV", mountId: "clover-card-cvv", label: "CVV" },
  { key: "cardPostalCode", type: "CARD_POSTAL_CODE", mountId: "clover-card-postal", label: "Postal code" },
] as const;

type FieldKey = (typeof FIELD_DEFS)[number]["key"];

// Styles passed into elements.create() to visually match the checkout card.
// Only fontFamily/fontSize on `body`/`input` are documented by Clover; color and
// placeholder are included defensively (standard in comparable hosted-field SDKs)
// and are simply ignored by Clover if unsupported.
const ELEMENT_STYLES = {
  body: { fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif", fontSize: "16px" },
  input: { fontSize: "16px", color: "#0f172a" },
};

type SdkStatus = "loading" | "ready" | "error";

function loadScriptOnce(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Clover) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CLOVER_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not reach Clover's secure payment service")));
      return;
    }
    const script = document.createElement("script");
    script.src = CLOVER_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not reach Clover's secure payment service"));
    document.head.appendChild(script);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export default function CloverPayment({ amount, onSuccess, onError, isProcessing }: CloverPaymentProps) {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("loading");
  const [sdkErrorDetail, setSdkErrorDetail] = useState<string>("");
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [retryNonce, setRetryNonce] = useState(0);

  const cloverRef = useRef<CloverInstance | null>(null);
  const elementsRef = useRef<Partial<Record<FieldKey, CloverElement>>>({});
  const formErrorRef = useRef<HTMLDivElement | null>(null);

  // Accessibility: a validation failure (invalid expiry, invalid CVV, a
  // decline, etc.) must be reachable without the customer having to hunt for
  // it - scroll it into view and move focus to it so screen reader users
  // land directly on the announced role="alert" region and sighted users on
  // a long multi-leg checkout page see it without scrolling manually.
  useEffect(() => {
    if (formError && formErrorRef.current) {
      formErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      formErrorRef.current.focus();
    }
  }, [formError]);

  // Memoized init promise: guarantees the Clover instance + hosted fields are
  // created exactly once for the component's lifetime, no matter how many
  // times the effect body runs (React Strict Mode intentionally runs it
  // mount -> cleanup -> mount in dev). Without this, a second run would
  // create a *second* Clover instance and mount a second set of iframes into
  // the same containers - the "kept loading" / "typed into the card but
  // nothing happened" bug came from exactly that: two Clover instances
  // fighting over the same DOM nodes, with tokenization running against
  // whichever instance's reference happened to win the race.
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const teardownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);

  const runInit = useCallback(() => {
    return withTimeout(
      (async () => {
        await withTimeout(loadScriptOnce(), SDK_LOAD_TIMEOUT_MS, "Secure payment service did not respond in time");

        const apiAccessKey = process.env.NEXT_PUBLIC_CLOVER_API_ACCESS_KEY;
        const merchantId = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID;
        if (!window.Clover || !apiAccessKey || !merchantId) {
          throw new Error(!window.Clover ? "SDK failed to load" : "Missing payment configuration");
        }

        const clover = new window.Clover(apiAccessKey, { merchantId });
        cloverRef.current = clover;
        const elements = clover.elements();

        for (const field of FIELD_DEFS) {
          const el = elements.create(field.type, ELEMENT_STYLES);
          el.mount(`#${field.mountId}`);
          el.addEventListener("change", (event) => {
            setFieldErrors((prev) => ({
              ...prev,
              [field.key]: event.error?.message || undefined,
            }));
          });
          elementsRef.current[field.key] = el;
        }
      })(),
      SDK_LOAD_TIMEOUT_MS + 5_000,
      "Secure payment fields did not finish loading"
    );
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    const myGeneration = generationRef.current;

    // If a new mount follows immediately (Strict Mode's synthetic remount),
    // cancel the deferred teardown scheduled by the previous cleanup below -
    // that cleanup wasn't a real unmount, so the singleton must survive.
    if (teardownTimerRef.current) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }

    let cancelled = false;
    setSdkStatus((prev) => (prev === "error" ? "loading" : prev));

    if (!initPromiseRef.current) {
      initPromiseRef.current = runInit();
    }

    initPromiseRef.current.then(
      () => {
        if (!cancelled && generationRef.current === myGeneration) setSdkStatus("ready");
      },
      (err: Error) => {
        console.error("Clover initialization failed:", err);
        if (!cancelled && generationRef.current === myGeneration) {
          setSdkErrorDetail(err.message || "Could not initialize secure payment fields");
          setSdkStatus("error");
        }
        // Allow a future retry to start a fresh attempt instead of replaying this failure forever.
        initPromiseRef.current = null;
      }
    );

    return () => {
      cancelled = true;
      teardownTimerRef.current = setTimeout(() => {
        for (const el of Object.values(elementsRef.current)) {
          try {
            el?.unmount?.();
          } catch {
            // best-effort cleanup
          }
        }
        elementsRef.current = {};
        cloverRef.current = null;
        initPromiseRef.current = null;
      }, 0);
    };
  }, [retryNonce, runInit]);

  const handleRetrySdk = () => {
    setSdkErrorDetail("");
    setFormError("");
    setSdkStatus("loading");
    setRetryNonce((n) => n + 1);
  };

  const handlePayment = async () => {
    setFormError("");

    if (sdkStatus !== "ready" || !cloverRef.current) {
      setFormError("Secure payment fields are not ready yet. Please wait a moment and try again.");
      return;
    }

    setIsTokenizing(true);
    try {
      const result = await withTimeout(
        cloverRef.current.createToken(),
        TOKENIZE_TIMEOUT_MS,
        "Tokenization is taking too long. Please try again."
      );

      if (result.errors && Object.keys(result.errors).length > 0) {
        // Map Clover's error keys onto our field state so each message renders
        // next to the relevant hosted field rather than as one generic banner.
        const mapped: Partial<Record<FieldKey, string>> = {};
        for (const [key, message] of Object.entries(result.errors)) {
          const field = FIELD_DEFS.find(
            (f) => f.type === key || f.key.toLowerCase() === key.toLowerCase()
          );
          if (field) mapped[field.key] = message;
        }
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
        const summary = Object.values(result.errors)[0] || "Please check your card details and try again.";
        setFormError(summary);
        onError(summary);
        return;
      }

      if (!result.token) {
        const msg = "Failed to generate payment token. Please try again.";
        setFormError(msg);
        onError(msg);
        return;
      }

      // Only the clv_ token and booking id are ever sent onward - no card data.
      onSuccess(result.token);
    } catch (err) {
      console.error("Clover tokenization error:", err);
      const msg = err instanceof Error && err.message.includes("too long")
        ? err.message
        : "Payment processing failed. Please check your details and try again.";
      setFormError(msg);
      onError(msg);
    } finally {
      // Always clears, even on timeout - the Pay button must never stay
      // disabled forever just because one attempt didn't resolve in time.
      setIsTokenizing(false);
    }
  };

  const busy = isProcessing || isTokenizing;
  const hasFieldError = Object.values(fieldErrors).some(Boolean);

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>Card details are securely handled by Clover</span>
      </div>

      {sdkStatus === "error" && (
        <div
          role="alert"
          className="space-y-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900"
        >
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Secure payment fields could not load{sdkErrorDetail ? ` (${sdkErrorDetail})` : ""}.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRetrySdk} className="w-full">
            Retry
          </Button>
        </div>
      )}

      {formError && (
        <div
          ref={formErrorRef}
          role="alert"
          tabIndex={-1}
          className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-800 dark:text-red-200">{formError}</p>
        </div>
      )}

      <fieldset
        className="space-y-3"
        disabled={busy || sdkStatus === "error"}
        aria-busy={sdkStatus === "loading"}
      >
        <legend className="sr-only">Card details</legend>

        <div>
          <label htmlFor="clover-card-name" className="block text-sm font-medium text-foreground mb-1.5">
            Cardholder name
          </label>
          {/* Clover mounts a same-origin-looking but isolated iframe into this div.
              Keystrokes go directly to Clover; this component never receives them. */}
          <div
            id="clover-card-name"
            className="w-full h-11 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors"
          />
          {fieldErrors.cardName && (
            <p id="clover-card-name-error" role="alert" className="text-xs text-destructive mt-1">
              {fieldErrors.cardName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="clover-card-number" className="block text-sm font-medium text-foreground mb-1.5">
            Card number
          </label>
          <div
            id="clover-card-number"
            className="w-full h-11 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors"
          />
          {fieldErrors.cardNumber && (
            <p id="clover-card-number-error" role="alert" className="text-xs text-destructive mt-1">
              {fieldErrors.cardNumber}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="clover-card-date" className="block text-sm font-medium text-foreground mb-1.5">
              Expiration
            </label>
            <div
              id="clover-card-date"
              className="w-full h-11 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors"
            />
            {fieldErrors.cardDate && (
              <p role="alert" className="text-xs text-destructive mt-1">{fieldErrors.cardDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="clover-card-cvv" className="block text-sm font-medium text-foreground mb-1.5">
              CVV
            </label>
            <div
              id="clover-card-cvv"
              className="w-full h-11 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors"
            />
            {fieldErrors.cardCvv && (
              <p role="alert" className="text-xs text-destructive mt-1">{fieldErrors.cardCvv}</p>
            )}
          </div>
          <div>
            <label htmlFor="clover-card-postal" className="block text-sm font-medium text-foreground mb-1.5">
              Postal code
            </label>
            <div
              id="clover-card-postal"
              className="w-full h-11 px-3 py-2 rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors"
            />
            {fieldErrors.cardPostalCode && (
              <p role="alert" className="text-xs text-destructive mt-1">{fieldErrors.cardPostalCode}</p>
            )}
          </div>
        </div>
      </fieldset>

      {sdkStatus === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Loading secure payment fields…
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          Sandbox test card: 4242 4242 4242 4242, any future expiration, CVV 123, any valid US ZIP code.
        </p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={busy || sdkStatus !== "ready"}
        aria-describedby={hasFieldError ? "clover-payment-form-errors" : undefined}
        className="w-full h-12 text-base bg-blue-gradient text-white font-semibold"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Processing payment…
          </span>
        ) : (
          `Pay & Reserve Ride — $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your card details are entered directly into Clover&apos;s secure payment fields and never pass through our servers.
      </p>
    </div>
  );
}
