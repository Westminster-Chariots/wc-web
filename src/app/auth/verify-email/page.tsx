"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Failed to verify email. The link may have expired.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Verifying Email
                </h1>
                <p className="text-sm text-muted-foreground font-body">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Email Verified!
                </h1>
                <p className="text-sm text-muted-foreground font-body mb-6">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground font-body mb-6">
                  Redirecting to sign in...
                </p>
                <Button variant="hero" className="w-full" onClick={() => router.push("/auth")}>
                  Go to Sign In
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Verification Failed
                </h1>
                <p className="text-sm text-muted-foreground font-body mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button variant="hero" className="w-full" onClick={() => router.push("/auth")}>
                    Return to Sign In
                  </Button>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Loading
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Please wait...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
