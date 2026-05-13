"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, UserCircle, LogOut, ChevronDown } from "lucide-react";
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
  lang: string;
  toggleLang: () => void;
}

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
  lang,
  toggleLang,
}: NavigationProps) {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-[1500ms] ease-in-out ${isOnLandingPage ? (isScrolled ? 'py-3' : 'py-6') : 'py-3'} ${!isOnLandingPage && isScrollingDown ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`transition-all duration-[1500ms] ease-in-out ${isOnLandingPage ? 'flex items-center justify-between gap-4' : ''}`}>
          {isOnLandingPage ? (
            // Split Navigation (Landing Page)
            <>
              {/* Logo - Left Side (Compact) */}
              <Link 
                href="/" 
                className={`group flex items-center justify-center transition-all duration-[1500ms] ease-in-out backdrop-blur-xl hover:scale-105 ${isScrolled ? 'glass-nav-merged rounded-full px-4 py-3 shadow-glass hover:shadow-glass-hover' : 'glass-nav-left rounded-full px-5 py-4 shadow-glass-elevated hover:shadow-glass-elevated-hover'}`}
              >
                <Image 
                  src="/assets/wc-logo-full.png" 
                  alt="Westminster Chariots" 
                  width={isScrolled ? 40 : 50} 
                  height={isScrolled ? 40 : 50} 
                  className="object-contain transition-all duration-[1500ms] ease-in-out group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
              </Link>

              {/* Navigation Container - Right Side (65% width on desktop) */}
              <div className={`flex items-center gap-3 transition-all duration-[1500ms] ease-in-out backdrop-blur-xl ${isScrolled ? 'glass-nav-merged rounded-full px-5 py-3 shadow-glass w-full md:w-[65%]' : 'glass-nav-right rounded-full px-6 py-4 shadow-glass-elevated-lower w-full md:w-[65%]'}`}>
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden text-foreground hover:text-primary transition-all duration-300 p-2 hover:scale-110 hover:rotate-90" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 flex-1">
                  {/* Services Dropdown */}
                  <ServicesDropdown />
                  
                  {/* Our Fleet */}
                  <a href="#fleet" className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative">
                    <span className="relative z-10">Our Fleet</span>
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </a>
                  
                  {/* Help */}
                  <a href="/help" className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative">
                    <span className="relative z-10">Help</span>
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </a>
                </nav>

                {/* User Menu */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                  {user ? (
                    <>
                      <Link href="/account" className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105">
                        <UserCircle className="h-4 w-4 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
                        <span className={`transition-all duration-500 ${isScrolled ? 'hidden xl:inline' : 'hidden lg:inline'}`}>{displayName}</span>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="group hidden md:block text-sm text-foreground hover:text-primary transition-all duration-300 font-medium relative">
                          <span className="relative z-10">Dashboard</span>
                          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </Link>
                      )}
                      <button onClick={handleSignOut} className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-destructive transition-all duration-300 hover:scale-110">
                        <LogOut className="h-4 w-4 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
                      </button>
                    </>
                  ) : (
                    <Link href="/auth" className="hidden md:block btn-primary px-5 py-2 rounded-full text-sm hover:scale-105 active:scale-95 transition-all duration-300">
                      Sign In
                    </Link>
                  )}
                  <button
                    onClick={toggleLang}
                    className="text-sm text-foreground/80 hover:text-foreground transition-all duration-300 font-medium hover:scale-110 hover:rotate-6"
                    aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
                  >
                    {lang === "en" ? "ES" : "EN"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Full Bar Navigation (Off Landing Page)
            <div className="glass-nav-merged rounded-full px-6 py-3 shadow-glass flex items-center justify-between backdrop-blur-xl transition-all duration-[1500ms] ease-in-out">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-all duration-300">
                <Image 
                  src="/assets/wc-logo-full.png" 
                  alt="Westminster Chariots" 
                  width={40} 
                  height={40} 
                  className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
              </Link>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-foreground hover:text-primary transition-all duration-300 p-2 hover:scale-110 hover:rotate-90" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {/* Services Dropdown */}
                <ServicesDropdown />
                
                {/* Our Fleet */}
                <a href="#fleet" className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative">
                  <span className="relative z-10">Our Fleet</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
                
                {/* Help */}
                <a href="/help" className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative">
                  <span className="relative z-10">Help</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                {user ? (
                  <>
                    <Link href="/account" className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105">
                      <UserCircle className="h-4 w-4 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
                      <span className="hidden lg:inline">{displayName}</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="group hidden md:block text-sm text-foreground hover:text-primary transition-all duration-300 font-medium relative">
                        <span className="relative z-10">Dashboard</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-destructive transition-all duration-300 hover:scale-110">
                      <LogOut className="h-4 w-4 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="hidden md:block btn-primary px-5 py-2 rounded-full text-sm hover:scale-105 active:scale-95 transition-all duration-300">
                    Sign In
                  </Link>
                )}
                <button
                  onClick={toggleLang}
                  className="text-sm text-foreground/80 hover:text-foreground transition-all duration-300 font-medium hover:scale-110 hover:rotate-6"
                  aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
                >
                  {lang === "en" ? "ES" : "EN"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="md:hidden border-t border-white/10 glass-card relative z-50"
            >
              <div className="px-6 py-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground/60 mb-2">Services</p>
                  <a href="/services#airport-transfer" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Airport Transfer</a>
                  <a href="/services#corporate-car-service" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Corporate Car Service</a>
                  <a href="/services#hourly-car-service" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Hourly Car Service</a>
                  <a href="/services#long-distance-car-service" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Long Distance Car Service</a>
                  <a href="/services#night-out" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Night out</a>
                  <a href="/services#concert-transportation" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Concert Transportation</a>
                  <a href="/services#transportation-for-wedding" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Transportation for Wedding</a>
                  <a href="/services#city-tours" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">City Tours</a>
                  <a href="/services#prom-limo-service" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Prom Limo Service</a>
                  <a href="/services#date-night" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground/80 hover:text-foreground pl-4">Date Night</a>
                </div>
                
                <a href="#fleet" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground">Our Fleet</a>
                <a href="/help" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground">Help</a>
                
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-base text-foreground">
                      <UserCircle className="h-5 w-5" />
                      {displayName}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-base text-foreground font-medium">Dashboard</Link>
                    )}
                    <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="flex items-center gap-2 text-base text-destructive">
                      <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="block btn-primary px-6 py-3 rounded-full text-base text-center">Sign In</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </header>
  );
}