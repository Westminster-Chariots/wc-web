"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Phone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/home/navigation/Navigation";
import { useRouter } from "next/navigation";

const STEP_LABELS = ["Service Class", "Pickup Info", "Log In", "Checkout"] as const;
const STEP_ROUTES = ["/book", "/book/details", "/book/login", "/book/checkout"] as const;

function getStepIndex(pathname: string): number {
  const index = STEP_ROUTES.findIndex((route) => pathname === route);
  return index === -1 ? 0 : index;
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = getStepIndex(pathname);
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isOnLandingPage={false}
        isScrolled={true}
        isScrollingDown={false}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        isAdmin={isAdmin}
        displayName={displayName}
        handleSignOut={handleSignOut}
        lang={lang}
        cycleLang={cycleLang}
      />

      {/* Progress Stepper */}
      <div className="fixed top-16 right-[5%] left-[5%] z-40 bg-background/95 backdrop-blur-md rounded-xl border border-border shadow-glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          {/* Desktop Stepper */}
          <nav className="hidden md:flex items-center justify-center gap-0">
            {STEP_LABELS.map((step, i) => (
              <div key={step} className="flex items-center">
                {i < currentStep ? (
                  <Link href={STEP_ROUTES[i]} className="flex items-center gap-2 group cursor-pointer">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      className="h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all border-primary bg-primary text-white shadow-blue group-hover:shadow-lg"
                    >
                      <Check className="h-4 w-4 text-black" />
                    </motion.div>
                    <span className="text-sm font-body text-muted-foreground group-hover:text-primary transition-colors">
                      {step}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-body font-semibold border-2 transition-all ${
                        i === currentStep
                          ? "border-primary bg-blue-gradient text-white shadow-blue ring-2 ring-primary/20"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-center justify-center w-full h-full">{i + 1}</span>
                    </motion.div>
                    <span
                      className={`text-sm font-body whitespace-nowrap ${
                        i === currentStep ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                )}
                {i < STEP_LABELS.length - 1 && (
                  <div className="relative mx-3 w-12 h-1 rounded-full overflow-hidden bg-border">
                    <motion.div
                      className="absolute inset-0 bg-blue-gradient"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i < currentStep ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Stepper */}
          <div className="md:hidden space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                {STEP_LABELS.map((step, i) => (
                  <div
                    key={step}
                    className="flex flex-col items-center"
                    style={{ width: `${100 / STEP_LABELS.length}%` }}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`rounded-full transition-all z-10 flex items-center justify-center ${
                        i === currentStep
                          ? "h-8 w-8 bg-blue-gradient shadow-blue border-2 border-white"
                          : i < currentStep
                          ? "h-6 w-6 bg-primary border-2 border-white"
                          : "h-6 w-6 bg-card border-2 border-border"
                      }`}
                    >
                      {i < currentStep ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : i === currentStep ? (
                        <span className="text-xs font-bold text-white flex items-center justify-center w-full h-full">
                          {i + 1}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center justify-center w-full h-full">
                          {i + 1}
                        </span>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
              <div
                className="absolute top-4 left-0 right-0 h-1 bg-border rounded-full"
                style={{ zIndex: 0 }}
              >
                <motion.div
                  className="h-full bg-blue-gradient rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${(currentStep / (STEP_LABELS.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
            <div className="text-center pt-2">
              <p className="text-sm font-body text-foreground font-semibold">
                {STEP_LABELS[currentStep]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step {currentStep + 1} of {STEP_LABELS.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-44 md:pt-40 pb-24">{children}</main>

      {/* Help Button */}
      <a
        href="tel:+15714351832"
        className="fixed bottom-6 right-6 z-40 glass-strong rounded-full p-4 shadow-glass-elevated hover:shadow-glass-elevated-hover transition-all duration-300 hover:scale-110 group"
      >
        <Phone className="h-5 w-5 text-primary group-hover:rotate-12 transition-all duration-300" />
      </a>
    </div>
  );
}
