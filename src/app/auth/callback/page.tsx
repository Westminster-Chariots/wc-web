"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const redirect = searchParams.get("redirect") || "/";

      if (!accessToken || !refreshToken) {
        setError("Authentication failed. Missing tokens.");
        setTimeout(() => router.push("/auth"), 3000);
        return;
      }

      try {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        await refreshUser();
        setSuccess(true);

        setTimeout(() => {
          router.push(redirect);
        }, 1500);
      } catch (err) {
        console.error("Callback error:", err);
        setError("Failed to complete authentication.");
        setTimeout(() => router.push("/auth"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-strong rounded-2xl border border-primary/30 p-8 shadow-glass-elevated">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-8">
              <Image 
                src="/assets/wc-logo-no-motto.png" 
                alt="Westminster Chariots" 
                width={240} 
                height={70} 
                className="object-contain mx-auto" 
              />
            </Link>
          </div>

          <div className="text-center space-y-6">
            {!error && !success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-16 w-16 text-primary mx-auto" />
                </motion.div>
                <div className="mt-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Completing Sign In
                  </h2>
                  <p className="text-sm text-muted-foreground font-body">
                    Please wait while we complete your authentication...
                  </p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                </motion.div>
                <div className="mt-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Success!
                  </h2>
                  <p className="text-sm text-muted-foreground font-body">
                    Redirecting you now...
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                </motion.div>
                <div className="mt-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Authentication Failed
                  </h2>
                  <p className="text-sm text-muted-foreground font-body mb-6">
                    {error}
                  </p>
                  <Button 
                    variant="hero" 
                    className="w-full bg-blue-gradient shadow-blue" 
                    onClick={() => router.push("/auth")}
                  >
                    Return to Sign In
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-strong rounded-2xl border border-primary/30 p-8 shadow-glass-elevated">
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-body mt-6">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
