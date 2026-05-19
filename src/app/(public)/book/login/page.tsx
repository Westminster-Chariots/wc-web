"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Phone, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/hooks/useBookingStore";
import { notify } from "@/lib/notify";

const typingPhrases = [
  "Almost there...",
  "Your ride awaits",
  "Premium service",
  "Luxury transportation"
];

export default function BookingLoginPage() {
  const router = useRouter();
  const { user, login, register } = useAuth();
  const { data } = useBookingStore();
  
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/book/checkout");
    }
  }, [user, router]);

  // Typing animation
  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    if (!isDeleting && typedText === currentPhrase) {
      setTimeout(() => setIsDeleting(true), pauseTime);
      return;
    }

    if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setTypedText(
        isDeleting
          ? currentPhrase.substring(0, typedText.length - 1)
          : currentPhrase.substring(0, typedText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

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
    <div className="flex min-h-screen">
        {/* Left — branding panel with typing animation */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          <Image
            src="/assets/fleet/fleet-escalade-interior.jpg"
            alt="Luxury chauffeur service"
            fill
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          
          {/* Animated gradient accent */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
  
          <div className="relative z-10 px-12 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="inline-block mb-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image 
                    src="/assets/wc-logo-full.png" 
                    alt="Westminster Chariots" 
                    width={280} 
                    height={80} 
                    className="object-contain drop-shadow-2xl" 
                  />
                </motion.div>
              </Link>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 className="text-4xl font-display font-bold text-white leading-tight mb-2">
                  Almost there
                </h2>
                <h2 className="text-4xl font-display font-bold leading-tight mb-6">
                  <span className="text-primary">Your ride awaits</span>
                </h2>
              </motion.div>

              {/* Typing animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mb-8"
              >
                <div className="h-8 flex items-center">
                  <span className="text-lg text-white/90 font-body">
                    {typedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-primary ml-1"
                    />
                  </span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-sm text-white/80 font-body leading-relaxed mb-8"
              >
                Sign in or create a free account to confirm your booking. It only takes a moment.
              </motion.p>

              {/* Booking summary pill */}
              {data.pickup && data.dropoff && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="glass-strong rounded-xl border border-primary/30 p-4 space-y-2 shadow-glass-elevated"
                >
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Your Trip</p>
                  <div className="flex items-start gap-2 text-xs font-body text-white">
                    <span className="text-primary mt-0.5">↑</span>
                    <span className="truncate">{data.pickup}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-body text-white/70">
                    <span className="text-white/70 mt-0.5">↓</span>
                    <span className="truncate">{data.dropoff}</span>
                  </div>
                  {data.selectedVehicle && (
                    <p className="text-[10px] text-white/60 uppercase tracking-wider pt-1 border-t border-white/20">
                      {data.selectedVehicle === "sedan" ? "Business Class Sedan" : "Business SUV"}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm relative z-10"
          >
            <div className="glass-strong rounded-2xl border border-primary/30 p-8 sm:p-10 shadow-glass-elevated">
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <Link href="/" className="inline-block">
                  <Image 
                    src="/assets/wc-logo-full.png" 
                    alt="Westminster Chariots" 
                    width={200} 
                    height={60} 
                    className="object-contain" 
                  />
                </Link>
              </div>

              <div className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={mode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-2xl font-display font-bold text-foreground"
                  >
                    {headings[mode]}
                  </motion.h1>
                </AnimatePresence>
                <p className="text-sm text-muted-foreground font-body mt-1">{subtitles[mode]}</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                  onKeyDown={handleKeyDown}
                >
                  {mode === "signup" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ls-name" className="text-xs font-body flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" /> Full Name
                        </Label>
                        <Input
                          id="ls-name"
                          placeholder="John Smith"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="glass-card border-primary/20 font-body h-11"
                          maxLength={100}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ls-phone" className="text-xs font-body flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" /> Phone <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id="ls-phone"
                          type="tel"
                          placeholder="(571) 435-1832"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="glass-card border-primary/20 font-body h-11"
                          maxLength={20}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="ls-email" className="text-xs font-body flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email
                    </Label>
                    <Input
                      id="ls-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-card border-primary/20 font-body h-11"
                      maxLength={255}
                      autoFocus={mode !== "signup"}
                    />
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-2">
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
                          className="glass-card border-primary/20 font-body h-11 pr-10"
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
                      className="w-full gap-2 h-11 bg-blue-gradient shadow-blue hover:shadow-blue"
                      onClick={handleForgotPassword}
                      disabled={loading || !email}
                    >
                      {loading ? "Sending..." : "Send Reset Link"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="hero"
                        className="w-full gap-2 h-11 bg-blue-gradient shadow-blue hover:shadow-blue"
                        onClick={handleEmailAuth}
                        disabled={loading || !email || !password || (mode === "signup" && !name)}
                      >
                        {loading ? "Please wait..." : mode === "signup" ? "Create Account & Continue" : "Sign In & Continue"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full h-11 gap-2 glass-card border-primary/20 hover:shadow-glass-hover"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=/book/checkout`}
                        type="button"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    </>
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
            </div>
          </motion.div>
        </div>
    </div>
  );
}
