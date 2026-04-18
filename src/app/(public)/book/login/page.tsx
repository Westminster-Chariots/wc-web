"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Check, Phone, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/hooks/useBookingStore";
import { notify } from "@/lib/notify";

const STEPS = ["Service Class", "Pickup Info", "Log In", "Payment", "Checkout"] as const;

export default function BookingLoginPage() {
  const router = useRouter();
  const { user, login, register } = useAuth();
  const { data, goToStep } = useBookingStore();
  
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStep = 2;

  useEffect(() => {
    if (user) {
      router.push("/book/checkout");
    }
  }, [user, router]);

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
        notify.success("Account created! Check your email to verify, then sign in.");
        setPassword("");
        setEmail("");
        setName("");
        setPhone("");
        setMode("login");
      } else {
        await login(email, password);
        router.push("/book/checkout");
      }
    } catch (err: any) {
      notify.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    setLoading(true);
    try {
      notify.success("Check your email for a password reset link.");
      // TODO: Implement password reset via backend
    } catch (err: any) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      mode === "forgot" ? handleForgotPassword() : handleEmailAuth();
    }
  };

  const headings = {
    login: "Sign in to continue",
    signup: "Create your account",
    forgot: "Reset your password",
  };

  const subtitles = {
    login: "Sign in to complete your booking.",
    signup: "One account for all your Westminster Chariots rides.",
    forgot: "We'll send a reset link to your email.",
  };

  return (
    <div className="flex">
        {/* Left — branding panel (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          <Image
            src="/assets/hero-mercedes.jpg"
            alt="Luxury sedan"
            fill
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
          <div 
    className="absolute inset-0" 
    style={{
      background: 'linear-gradient(to right, hsla(0, 0%, 4%, 1), hsla(0, 0%, 4%, 0.85), hsla(0, 0%, 4%, 0.3))'
    }} 
  />

  {/* Vertical: from-background/80 via-transparent to-background/40 */}
  <div 
    className="absolute inset-0" 
    style={{
      background: 'linear-gradient(to top, hsla(0, 0%, 4%, 0.8), transparent, hsla(0, 0%, 4%, 0.4))'
    }} 
  />
  
          <div className="relative z-10 px-12 max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-10">
              <div className="relative h-12 w-12">
                <Image src="/assets/wc-logo-white.png" alt="Westminster Chariots" fill className="object-contain" />
              </div>
              <div>
                <p className="text-base font-display font-bold text-foreground">Westminster Chariots</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-primary font-body">Travel in Luxury · Arrive in Style</p>
              </div>
            </Link>

            <h2 className="text-3xl font-display font-bold text-foreground leading-tight mb-4">
              Almost there —<br /><span className="text-primary">your ride awaits</span>
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-8">
              Sign in or create a free account to confirm your booking. It only takes a moment.
            </p>

            {/* Booking summary pill */}
            {data.pickup && data.dropoff && (
              <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Your Trip</p>
                <div className="flex items-start gap-2 text-xs font-body text-foreground">
                  <span className="text-primary mt-0.5">↑</span>
                  <span className="truncate">{data.pickup}</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                  <span className="text-muted-foreground mt-0.5">↓</span>
                  <span className="truncate">{data.dropoff}</span>
                </div>
                {data.selectedVehicle && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-1 border-t border-border/40">
                    {data.selectedVehicle === "sedan" ? "Business Class Sedan" : "Business SUV"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="relative h-9 w-9">
                <Image src="/assets/wc-logo-white.png" alt="Westminster Chariots" fill className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-foreground">Westminster Chariots</p>
                <p className="text-[8px] uppercase tracking-[0.2em] text-primary font-body">Travel in Luxury · Arrive in Style</p>
              </div>
            </div>

            <div className="mb-7">
              <h1 className="text-2xl font-display font-bold text-foreground">{headings[mode]}</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">{subtitles[mode]}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="space-y-4"
                onKeyDown={handleKeyDown}
              >
                {mode === "signup" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="ls-name" className="text-xs font-body flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" /> Full Name
                      </Label>
                      <Input
                        id="ls-name"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-secondary border-border font-body h-11"
                        maxLength={100}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ls-phone" className="text-xs font-body flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary" /> Phone <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="ls-phone"
                        type="tel"
                        placeholder="(571) 435-1832"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-secondary border-border font-body h-11"
                        maxLength={20}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="ls-email" className="text-xs font-body flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email
                  </Label>
                  <Input
                    id="ls-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border font-body h-11"
                    maxLength={255}
                    autoFocus={mode !== "signup"}
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ls-password" className="text-xs font-body flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="ls-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-secondary border-border font-body h-11 pr-10"
                        maxLength={255}
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
                        className="text-[11px] text-muted-foreground hover:text-primary font-body transition-colors mt-0.5"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                )}

                {mode === "forgot" ? (
                  <Button
                    variant="hero"
                    className="w-full gap-2 h-11"
                    onClick={handleForgotPassword}
                    disabled={loading || !email}
                  >
                    {loading ? "Sending..." : "Send Reset Link"} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    className="w-full gap-2 h-11"
                    onClick={handleEmailAuth}
                    disabled={loading || !email || !password || (mode === "signup" && !name)}
                  >
                    {loading ? "Please wait..." : mode === "signup" ? "Create Account & Continue" : "Sign In & Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}

                <div className="pt-1 text-center space-y-1.5">
                  {mode === "login" && (
                    <p className="text-xs text-muted-foreground font-body">
                      No account?{" "}
                      <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                        Sign up free
                      </button>
                    </p>
                  )}
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground font-body">
                      Already have an account?{" "}
                      <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                        Sign in
                      </button>
                    </p>
                  )}
                  {mode === "forgot" && (
                    <button onClick={() => setMode("login")} className="text-xs text-primary hover:underline font-body">
                      ← Back to sign in
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <button
                onClick={() => router.push("/book/details")}
                className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
              >
                ← Back to trip details
              </button>
            </div>
          </motion.div>
        </div>
    </div>
  );
}
