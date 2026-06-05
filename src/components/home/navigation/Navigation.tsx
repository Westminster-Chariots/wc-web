"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle, LogOut, Globe } from "lucide-react";
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
  cycleLang,
}: NavigationProps) {
  const [isOverHero, setIsOverHero] = useState(true);

  // Detect if navbar is over hero section
  useEffect(() => {
    if (typeof window !== 'undefined' && isOnLandingPage) {
      const handleScroll = () => {
        const heroHeight = window.innerHeight;
        setIsOverHero(window.scrollY < heroHeight - 100);
      };
      
      handleScroll(); // Initial check
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isOnLandingPage]);

  // Determine if we should use dark theme styling (on landing page and over hero)
  const useDarkTheme = isOnLandingPage && isOverHero;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${
        isOnLandingPage ? (isScrolled ? 'py-3' : 'py-6') : 'py-3'
      } ${!isOnLandingPage && isScrollingDown ? '-translate-y-full' : 'translate-y-0'}`}
      data-nav-theme={useDarkTheme ? 'dark' : 'light'}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {isOnLandingPage ? (
          // Three-Section Navigation (Landing Page)
          <div className="flex items-center justify-between gap-4">
            {/* Left Section - Logo Only */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`transition-all duration-700 ease-in-out ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}
            >
              <Link 
                href="/" 
                className="group flex items-center justify-center transition-all duration-500 hover:scale-105"
              >
                <div className="relative">
                  <Image 
                    src="/assets/wc-logo-no-motto.png" 
                    alt="Westminster Chariots" 
                    width={isScrolled ? 55 : 140} 
                    height={isScrolled ? 55 : 170} 
                    className="object-contain transition-all duration-700 group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                  />
                </div>
              </Link>
            </motion.div>

            {/* Middle Section - Navigation Links */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`hidden md:flex items-center gap-8 glass-nav-center rounded-full px-8 py-4 backdrop-blur-xl transition-all duration-700 ease-in-out ${
                isScrolled ? 'scale-95 py-3' : 'scale-100'
              }`}
            >
              <ServicesDropdown isDark={useDarkTheme} />
              
              <a 
                href="/fleet" 
                className={`group text-sm font-medium transition-all duration-300 relative ${
                  useDarkTheme ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                <span className="relative z-10">Our Fleet</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
              
              <a 
                href="/help" 
                className={`group text-sm font-medium transition-all duration-300 relative ${
                  useDarkTheme ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                <span className="relative z-10">Help</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            </motion.nav>

            {/* Right Section - User Menu & Language */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`flex items-center gap-2.5 glass-nav-right rounded-full px-4 py-2.5 backdrop-blur-xl transition-all duration-700 ease-in-out ${
                isScrolled ? 'scale-95 py-3' : 'scale-100'
              }`}
            >
              {/* Mobile Menu Button */}
              <button 
                className={`md:hidden rounded-full border border-white/15 bg-white/10 shadow-sm transition-all duration-300 p-3 hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
                  useDarkTheme ? 'text-white hover:text-blue-300' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center gap-2.5">
                {user ? (
                  <>
                    <Link 
                      href="/account" 
                      className={`btn-primary px-3.5 py-2 rounded-full group flex items-center gap-1.5 text-[11px] transition-all duration-300 hover:scale-105 ${
                        useDarkTheme ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
                      }`}
                    >
                      <UserCircle className="h-3 w-3 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
                      <span className={`transition-all duration-500 ${isScrolled ? 'hidden xl:inline' : 'hidden lg:inline'}`}>
                        {displayName}
                      </span>
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className={`group text-[11px] font-medium relative transition-all duration-300 ${
                          useDarkTheme ? 'text-white/90 hover:text-white' : 'text-foreground hover:text-primary'
                        }`}
                      >
                        <span className="relative z-10">Dashboard</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut} 
                      className={`group flex items-center gap-1.5 text-[11px] transition-all duration-300 hover:scale-110 ${
                        useDarkTheme ? 'text-white/90 hover:text-red-400' : 'text-foreground/80 hover:text-destructive'
                      }`}
                    >
                      <LogOut className="h-3 w-3 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/auth" 
                    className="btn-primary px-3.5 py-2 rounded-full text-[11px] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                )}
                
                {/* Language Toggle */}
                {/* <div className={`border-l pl-2.5 ${
                  useDarkTheme ? 'border-white/20' : 'border-white/10'
                }`}>
                  <button
                    onClick={cycleLang}
                    className={`group flex items-center gap-1 text-[11px] font-semibold transition-all duration-300 hover:scale-110 ${
                      useDarkTheme ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
                    }`}
                    aria-label={`Switch language - Current: ${lang}`}
                  >
                    <Globe className="h-3 w-3 group-hover:rotate-12 transition-all duration-300" />
                    <span>{lang}</span>
                  </button>
                </div> */}
              </div>
            </motion.div>
          </div>
        ) : (
          // Merged Single Bar Navigation (Off Landing Page)
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-nav-merged rounded-full px-6 py-3 shadow-glass flex items-center justify-between backdrop-blur-xl"
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-all duration-300">
              <Image 
                src="/assets/wc-logo-no-motto.png" 
                alt="Westminster Chariots" 
                width={40} 
                height={40} 
                className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
              />
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden rounded-full border border-white/15 bg-white/10 shadow-sm p-3 transition-all duration-300 hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-blue-400/40 text-foreground" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <ServicesDropdown isDark={false} />
              
              <a 
                href="/fleet" 
                className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative"
              >
                <span className="relative z-10">Our Fleet</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
              
              <a 
                href="/help" 
                className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative"
              >
                <span className="relative z-10">Help</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              {user ? (
                <>
                  <Link 
                    href="/account" 
                    className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
                  >
                    <UserCircle className="h-4 w-4 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
                    <span className="hidden lg:inline">{displayName}</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="group hidden md:block text-sm text-foreground hover:text-primary transition-all duration-300 font-medium relative"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut} 
                    className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-destructive transition-all duration-300 hover:scale-110"
                  >
                    <LogOut className="h-4 w-4 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="hidden md:block btn-primary px-5 py-2 rounded-full text-sm hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
              
              {/* Language Toggle */}
              {/* <button
                onClick={cycleLang}
                className="group flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-110"
                aria-label={`Switch language - Current: ${lang}`}
              >
                <Globe className="h-4 w-4 group-hover:rotate-12 transition-all duration-300" />
                <span>{lang}</span>
              </button> */}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed h-[100vh] inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden mt-4 border rounded-3xl relative z-50 overflow-y-auto shadow-glass max-h-[80vh] w-full ${
                useDarkTheme 
                  ? ' border-white/10 backdrop-blur-xl' 
                  : 'bg-white border-white/10'
              }`}
            >
              <div className="px-5 py-6 space-y-5 sm:px-6">
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className={`block text-base font-medium hover:text-primary transition-colors duration-200 py-3 ${
                  useDarkTheme ? 'text-white/90' : 'text-gray-900'
                }`}>Services</a>
                <a href="/fleet" onClick={() => setMobileMenuOpen(false)} className={`block text-base font-medium hover:text-primary transition-colors duration-200 py-3 ${
                  useDarkTheme ? 'text-white/90' : 'text-gray-900'
                }`}>Our Fleet</a>
                <a href="/help" onClick={() => setMobileMenuOpen(false)} className={`block text-base font-medium hover:text-primary transition-colors duration-200 py-3 ${
                  useDarkTheme ? 'text-white/90' : 'text-gray-900'
                }`}>Help</a>
                
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 text-base py-2 ${
                      useDarkTheme ? 'text-white/90' : 'text-gray-900'
                    }`}>
                      <UserCircle className="h-5 w-5" />
                      {displayName}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`block text-base font-medium py-2 ${
                        useDarkTheme ? 'text-white/90' : 'text-gray-900'
                      }`}>Dashboard</Link>
                    )}
                    <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="flex items-center gap-2 text-base text-destructive py-2">
                      <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="block btn-primary px-6 py-3 rounded-full text-base text-center">Sign In</Link>
                )}
                
                {/* Language Toggle in Mobile */}
                {/* <div className={`pt-4 border-t ${
                  useDarkTheme ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <button
                    onClick={cycleLang}
                    className={`flex items-center gap-2 text-base font-semibold hover:text-primary transition-all duration-300 ${
                      useDarkTheme ? 'text-white/90' : 'text-gray-900'
                    }`}
                  >
                    <Globe className="h-5 w-5" />
                    <span>Language: {lang}</span>
                  </button>
                </div> */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
