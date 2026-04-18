"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/useAuth";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  useEffect(() => {
    // Check for token in URL params
    const token = searchParams.get("token");
    if (token) {
      setReady(true);
    }
  }, [searchParams]);

  const handleReset = async () => {
    const token = searchParams.get("token");
    if (!token) {
      notify.error("Invalid reset link");
      return;
    }

    if (password.length < 6) {
      notify.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      notify.success("Password updated — you can now sign in.");
      router.push("/auth");
    } catch (err: unknown) {
      const error = err as Error;
      notify.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleReset();
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground font-body">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Set New Password</h1>
        <p className="text-sm text-muted-foreground font-body">
          Enter your new password below.
        </p>
      </div>

      <div className="space-y-4" onKeyDown={handleKeyDown}>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-body flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" /> New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="bg-secondary border-border font-body h-11 pr-10"
              minLength={6}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-body flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" /> Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              className="bg-secondary border-border font-body h-11 pr-10"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          variant="hero"
          className="w-full gap-2 h-11"
          onClick={handleReset}
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? "Updating..." : "Update Password"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/auth")}
          className="text-sm text-primary hover:underline font-body"
        >
          ← Back to sign in
        </button>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}