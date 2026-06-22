"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import ServicesDropdown from "./ServicesDropdown";

interface NavigationProps {
  isOnLandingPage: boolean;
  isScrolled: boolean;
  isScrollingDown: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  user: any;
  isAdmin: boolean;
  displayName: string;
  handleSignOut: () => void;
  lang: "EN" | "ES" | "DE";
  cycleLang: () => void;
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function Navigation({
  isOnLandingPage,
  isScrolled,
  isScrollingDown,
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
  isAdmin,
  displayName,
  handleSignOut,
}: NavigationProps) {
  const [isOverHero, setIsOverHero] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !isOnLandingPage) return;
    const onScroll = () => setIsOverHero(window.scrollY < window.innerHeight - 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOnLandingPage]);

  const useDarkTheme = isOnLandingPage && isOverHero;

  return (
    <motion.header
      className="fixed top-0 w-full z-50"
      animate={{
        paddingTop: isOnLandingPage ? (isScrolled ? 12 : 24) : 12,
        paddingBottom: isOnLandingPage ? (isScrolled ? 12 : 24) : 12,
        y: !isOnLandingPage && isScrollingDown ? "-100%" : "0%",
      }}
      transition={{ duration: 0.55, ease }}
      data-nav-theme={useDarkTheme ? "dark" : "light"}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isOnLandingPage ? (
            /* ── Three-section landing nav ── */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease }}
              className="flex items-center justify-between gap-4"
            >
              {/* Logo */}
              <Link
                href="/"
                className="group flex items-center justify-center transition-transform duration-300 hover:scale-105"
              >
                <motion.div
                  animate={{ height: isScrolled ? 50 : 90 }}
                  transition={{ duration: 0.55, ease }}
                  className="relative"
                  style={{ width: "auto" }}
                >
                  <Image
                    src="/assets/wc-logo-no-motto-no-bg.png"
                    alt="Westminster Chariots"
                    width={120}
                    height={120}
                    style={{ width: "auto", height: "100%" }}
                    className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  />
                </motion.div>
              </Link>

              {/* Centre nav pill */}
              <motion.nav
                animate={{ scale: isScrolled ? 0.95 : 1 }}
                transition={{ duration: 0.55, ease }}
                className="hidden md:flex items-center gap-8 glass-nav-center rounded-full px-8 py-4 backdrop-blur-xl"
              >
                <ServicesDropdown isDark={useDarkTheme} />
                <NavLink href="/fleet" dark={useDarkTheme}>Our Fleet</NavLink>
                <NavLink href="/help" dark={useDarkTheme}>Help</NavLink>
              </motion.nav>

              {/* Right pill */}
              <motion.div
                animate={{ scale: isScrolled ? 0.95 : 1 }}
                transition={{ duration: 0.55, ease }}
                className="flex items-center gap-2.5 glass-nav-right rounded-full px-4 py-2.5 backdrop-blur-xl"
              >
                {/* Mobile button */}
                <button
                  className={`md:hidden rounded-full border border-white/15 bg-white/10 p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
                    useDarkTheme ? "text-white" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Desktop user */}
                <div className="hidden md:flex items-center gap-2.5">
                  <UserActions
                    user={user}
                    isAdmin={isAdmin}
                    displayName={displayName}
                    handleSignOut={handleSignOut}
                    dark={useDarkTheme}
                    small
                  />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Merged single bar nav ── */
            <motion.div
              key="merged"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease }}
              className="glass-nav-merged rounded-full px-6 py-3 shadow-glass flex items-center justify-between backdrop-blur-xl"
            >
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-all duration-300">
                <Image
                  src="/assets/wc-logo-no-motto-no-bg.png"
                  alt="Westminster Chariots"
                  width={40}
                  height={40}
                  style={{ width: "auto", height: "40px" }}
                  className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </Link>

              {/* Links */}
              <nav className="hidden md:flex items-center gap-6">
                <ServicesDropdown isDark={false} />
                <NavLink href="/about-us">About Us</NavLink>
                <NavLink href="/fleet">Our Fleet</NavLink>
                <NavLink href="/help">Help</NavLink>
              </nav>

              {/* User */}
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <div className="hidden md:flex items-center gap-3">
                  <UserActions
                    user={user}
                    isAdmin={isAdmin}
                    displayName={displayName}
                    handleSignOut={handleSignOut}
                  />
                </div>
                <button
                  className="md:hidden rounded-full border border-white/15 bg-white/10 p-3 transition-all duration-300 hover:scale-110 text-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 h-[100vh] bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.3, ease }}
              className={`md:hidden mt-4 border rounded-3xl relative z-50 overflow-y-auto shadow-glass max-h-[80vh] w-full ${
                useDarkTheme ? "border-white/10 backdrop-blur-xl" : "bg-white border-white/10"
              }`}
            >
              <div className="px-5 py-6 space-y-1 sm:px-6">
                {[
                  { href: "/services", label: "Services" },
                  { href: "/fleet", label: "Our Fleet" },
                  { href: "/about-us", label: "About Us" },
                  { href: "/help", label: "Help" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-medium hover:text-primary transition-colors duration-200 py-3 ${
                      useDarkTheme ? "text-white/90" : "text-gray-900"
                    }`}
                  >
                    {label}
                  </a>
                ))}

                <div className="pt-3 border-t border-white/10 mt-3">
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 text-base py-2 ${useDarkTheme ? "text-white/90" : "text-gray-900"}`}
                      >
                        <UserCircle className="h-5 w-5" />
                        {displayName}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block text-base font-medium py-2 ${useDarkTheme ? "text-white/90" : "text-gray-900"}`}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                        className="flex items-center gap-2 text-base text-destructive py-2"
                      >
                        <LogOut className="h-5 w-5" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block btn-primary px-6 py-3 rounded-full text-base text-center"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ── Small reusable pieces ── */

function NavLink({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group text-sm font-medium transition-all duration-300 relative ${
        dark ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground"
      }`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </a>
  );
}

function UserActions({
  user,
  isAdmin,
  displayName,
  handleSignOut,
  dark = false,
  small = false,
}: {
  user: any;
  isAdmin: boolean;
  displayName: string;
  handleSignOut: () => void;
  dark?: boolean;
  small?: boolean;
}) {
  const textSize = small ? "text-[11px]" : "text-sm";

  if (!user) {
    return (
      <Link
        href="/auth"
        className={`btn-primary rounded-full hover:scale-105 active:scale-95 transition-all duration-300 ${
          small ? "px-3.5 py-2 text-[11px]" : "px-5 py-2 text-sm"
        }`}
      >
        Sign In
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className={`group flex items-center gap-1.5 ${textSize} transition-all duration-300 hover:scale-105 ${
          dark ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground"
        }`}
      >
        <UserCircle className="h-4 w-4 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
        <span className="hidden lg:inline">{displayName}</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className={`group ${textSize} font-medium relative transition-all duration-300 ${
            dark ? "text-white/90 hover:text-white" : "text-foreground hover:text-primary"
          }`}
        >
          <span className="relative z-10">Dashboard</span>
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className={`group flex items-center gap-1.5 ${textSize} transition-all duration-300 hover:scale-110 ${
          dark ? "text-white/90 hover:text-red-400" : "text-foreground/80 hover:text-destructive"
        }`}
      >
        <LogOut className="h-3.5 w-3.5 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
      </button>
    </>
  );
}
