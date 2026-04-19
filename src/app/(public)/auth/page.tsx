"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register, forgotPassword } = useAuth();

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    if (mode === "signup" && !name) {
      notify.error("Please enter your full name.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await register(email, password, name, phone);
        notify.success("Account created successfully. You can now sign in.");
        setMode("login");
      } else {
        await login(email, password);
        router.push("/");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || "An error occurred";
      const errorCode = err?.response?.data?.code;
      
      if (errorCode === "EMAIL_EXISTS") {
        notify.error(
          <div>
            <p className="font-semibold">This email is already registered.</p>
            <button 
              onClick={() => setMode("login")} 
              className="text-primary underline mt-1 text-sm"
            >
              Click here to log in instead
            </button>
          </div>,
          { duration: 6000 }
        );
      } else {
        notify.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      notify.success("Check your email for a password reset link.");
    } catch (err: unknown) {
      const error = err as Error;
      notify.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "forgot") handleForgotPassword();
      else handleEmailAuth();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <Image src="/assets/hero-mercedes.jpg" alt="Luxury sedan" fill className="object-cover" priority sizes="50vw" />
        <div 
    className="absolute inset-0" 
    style={{
      background: 'linear-gradient(to right, hsla(0, 0%, 4%, 1), hsla(0, 0%, 4%, 0.7), hsla(0, 0%, 4%, 0.3))'
    }} 
  />

  {/* Vertical: from-background (100%) via-transparent to-background/20 */}
  <div 
    className="absolute inset-0" 
    style={{
      background: 'linear-gradient(to top, hsla(0, 0%, 4%, 1), transparent, hsla(0, 0%, 4%, 0.2))'
    }} 
  />
  <div className="relative z-10 px-12 max-w-lg">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Image src="/assets/wc-logo-white.png" alt="WC" width={48} height={48} loading="eager" className="object-contain" style={{ width: "auto", height: "auto" }} />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">Westminster Chariots</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body">Travel in Luxury · Arrive in Style</p>
            </div>
          </Link>
          <h2 className="text-3xl font-display font-bold text-foreground leading-tight mb-4">
            Your Chariot<br /><span className="text-primary">Awaits</span>
          </h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Distinguished executive transportation across the DC Metropolitan area. Sign in to manage your bookings and experience premium service.
          </p>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/assets/wc-logo-white.png" alt="WC" width={40} height={40} loading="eager" className="object-contain" style={{ width: "auto", height: "auto" }} />
              <div className="text-left">
                <h1 className="text-sm font-display font-bold text-foreground">Westminster Chariots</h1>
                <p className="text-[8px] uppercase tracking-[0.2em] text-primary font-body">Travel in Luxury · Arrive in Style</p>
              </div>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {mode === "forgot" ? "Reset Password" : mode === "signup" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {mode === "forgot"
                ? "Enter your email and we'll send you a reset link."
                : mode === "signup"
                ? "Join Westminster Chariots for premium bookings."
                : "Sign in to your Westminster Chariots account."}
            </p>
          </div>

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-body flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="bg-secondary border-border font-body h-11"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-body flex items-center gap-1.5">
                    <span className="text-primary text-sm">📱</span> Phone <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(571) 435-1832"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    className="bg-secondary border-border font-body h-11"
                    maxLength={20}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-body flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-secondary border-border font-body h-11"
                maxLength={255}
                autoFocus={mode !== "signup"}
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-body flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="bg-secondary border-border font-body h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "login" && (
                  <button
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-muted-foreground hover:text-primary font-body transition-colors mt-1"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {mode === "forgot" ? (
              <Button variant="hero" className="w-full gap-2 h-11" onClick={handleForgotPassword} disabled={loading || !email}>
                {loading ? "Sending..." : "Send Reset Link"} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="hero" className="w-full gap-2 h-11" onClick={handleEmailAuth} disabled={loading || !email || !password || (mode === "signup" && !name)}>
                {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            {mode === "login" && (
              <p className="text-sm text-muted-foreground font-body">
                Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign up</button>
              </p>
            )}
            {mode === "signup" && (
              <p className="text-sm text-muted-foreground font-body">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline font-body">
                ← Back to sign in
              </button>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors">
              ← Back to Westminster Chariots
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}