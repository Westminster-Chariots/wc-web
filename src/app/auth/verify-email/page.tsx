"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
                src="/assets/wc-logo-no-motto-no-bg.png" 
                alt="Westminster Chariots" 
                width={240} 
                height={70} 
                className="object-contain mx-auto" 
              />
            </Link>
          </div>

          <div className="text-center space-y-6">
            {status === "loading" && (
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
                    Verifying Email
                  </h2>
                  <p className="text-sm text-muted-foreground font-body">
                    Please wait while we verify your email address...
                  </p>
                </div>
              </motion.div>
            )}

            {status === "success" && (
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
                    Email Verified!
                  </h2>
                  <p className="text-sm text-muted-foreground font-body mb-4">
                    {message}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mb-6">
                    Redirecting to sign in...
                  </p>
                  <Button 
                    variant="hero" 
                    className="w-full bg-blue-gradient shadow-blue" 
                    onClick={() => router.push("/auth")}
                  >
                    Go to Sign In
                  </Button>
                </div>
              </motion.div>
            )}

            {status === "error" && (
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
                    Verification Failed
                  </h2>
                  <p className="text-sm text-muted-foreground font-body mb-6">
                    {message}
                  </p>
                  <div className="space-y-3">
                    <Button 
                      variant="hero" 
                      className="w-full bg-blue-gradient shadow-blue" 
                      onClick={() => router.push("/auth")}
                    >
                      Return to Sign In
                    </Button>
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full glass-card border-primary/20">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-strong rounded-2xl border border-primary/30 p-8 shadow-glass-elevated">
            <div className="text-center space-y-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Loading
                </h2>
                <p className="text-sm text-muted-foreground font-body">
                  Please wait...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
