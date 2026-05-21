"use client";
import { LayoutDashboard, Calendar, Car, Users, FileText, Map, DollarSign, Settings, Shield, ChevronLeft, Menu, Megaphone, User, LogOut, Home, BarChart3, Bell, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives";

const navGroups = [
  {
    title: "Operations",
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Calendar, label: 'Schedule', path: '/admin/schedule' },
      { icon: FileText, label: 'Manifests', path: '/admin/manifests' },
      { icon: Map, label: 'Live Map', path: '/admin/map' },
    ]
  },
  {
    title: "Resources",
    items: [
      { icon: Car, label: 'Fleet', path: '/admin/fleet' },
      { icon: Users, label: 'Drivers', path: '/admin/drivers' },
      { icon: Users, label: 'Clients', path: '/admin/clients' },
    ]
  },
  {
    title: "Business",
    items: [
      { icon: DollarSign, label: 'Pricing', path: '/admin/pricing' },
      { icon: Megaphone, label: 'Campaigns', path: '/admin/campaigns' },
    ]
  }
];

const bottomItems = [
  { icon: Shield, label: 'Audit Log', path: '/admin/audit' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

function PremiumSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 280 }} 
      transition={{ duration: 0.3, ease: "easeInOut" }} 
      className="fixed left-0 top-0 h-screen glass-strong border-r border-white/[0.12] flex flex-col z-50 hidden md:flex shadow-glass-elevated"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/[0.08]">
        <Link href="/" className="relative group block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            <Image 
              src="/assets/wc-logo-full.png" 
              alt="Westminster Chariots" 
              width={collapsed ? 40 : 160} 
              height={40} 
              className="relative object-contain shrink-0 transition-all duration-300" 
              style={{
                objectFit: 'contain',
                maxWidth: collapsed ? '40px' : '60px',
                height: '40px'
              }}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }} 
                  animate={{ opacity: 1, width: 'auto' }} 
                  exit={{ opacity: 0, width: 0 }} 
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div className="ml-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body font-semibold">
                      Admin Portal
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {/* Group Title */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold font-body">
                    {group.title}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <motion.button
                    key={item.label}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(item.path)}
                    className={`relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body transition-all duration-300 cursor-pointer group ${
                      active
                        ? 'bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 text-primary border-2 border-primary shadow-lg shadow-primary/30'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent hover:border-primary/30'
                    }`}
                  >
                    {/* Active indicator - More prominent */}
                    {active && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-gradient-to-b from-primary to-primary/80 rounded-r-full shadow-lg shadow-primary/50"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                    
                    {/* Icon with stronger active state */}
                    <div className={`relative ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                      <div className={`absolute inset-0 rounded-lg blur-md ${
                        active ? 'bg-primary/50' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
                      } transition-opacity duration-300`} />
                      <item.icon className={`relative h-5 w-5 shrink-0 transition-colors ${
                        active ? 'scale-110' : ''
                      }`} />
                    </div>
                    
                    {/* Label with stronger active state */}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          className={`truncate font-medium ${
                            active ? 'font-semibold' : ''
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Active checkmark or hover arrow */}
                    {!collapsed && (
                      <div className="ml-auto">
                        {active ? (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </motion.div>
                        ) : (
                          <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-6 border-t border-white/[0.08] space-y-1">
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body transition-all duration-300 cursor-pointer group ${
                active
                  ? 'bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 text-primary border-2 border-primary shadow-lg shadow-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent hover:border-primary/30'
              }`}
            >
              {/* Active indicator */}
              {active && (
                <motion.div 
                  layoutId="activeIndicatorBottom"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-gradient-to-b from-primary to-primary/80 rounded-r-full shadow-lg shadow-primary/50"
                />
              )}
              
              <div className={`relative ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                <div className={`absolute inset-0 rounded-lg blur-md ${
                  active ? 'bg-primary/50' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
                } transition-opacity duration-300`} />
                <item.icon className={`relative h-5 w-5 shrink-0 transition-colors ${active ? 'scale-110' : ''}`} />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className={`truncate font-medium ${active ? 'font-semibold' : ''}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Active checkmark */}
              {!collapsed && active && (
                <div className="ml-auto">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </motion.div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Button */}
      <div className="px-4 pb-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 font-body transition-all duration-300 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg blur-md bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ChevronLeft className={`relative h-5 w-5 shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

function PremiumMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setOpen(!open)} 
        className="p-3 rounded-xl glass hover:bg-muted/50 transition-colors relative group flex items-center justify-center"
        aria-label="Open menu"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Menu className="relative h-6 w-6 text-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 w-screen h-screen z-[99] bg-black/70 backdrop-blur-md" 
              onClick={handleClose}
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-white/60 backdrop-blur-xl border-r border-white/[0.12] flex flex-col z-[100]" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/[0.08] bg-background/95 backdrop-blur-xl flex items-center justify-between shrink-0">
                <Link href="/" onClick={handleClose} className="block">
                  <div className="flex items-center gap-3">
                    <Image 
                      src="/assets/wc-logo-full.png" 
                      alt="Westminster Chariots" 
                      width={160} 
                      height={40} 
                      className="object-contain" 
                      style={{
                        objectFit: 'contain',
                        maxWidth: '160px',
                        height: '40px'
                      }}
                    />
                    <div className="ml-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body font-semibold">
                        Admin Portal
                      </p>
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground rotate-180" />
                </button>
              </div>
            <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  {/* Group Title */}
                  <div className="px-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold font-body">
                      {group.title}
                    </p>
                  </div>
                  
                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.label}
                          onClick={() => { router.push(item.path); handleClose(); }}
                          className={`relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body transition-all duration-300 cursor-pointer ${
                            active
                              ? 'bg-primary/20 text-primary border-2 border-primary shadow-lg shadow-primary/20'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent hover:border-primary/30'
                          }`}
                        >
                          {/* Active indicator */}
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-gradient-to-b from-primary to-primary/80 rounded-r-full shadow-lg shadow-primary/50" />
                          )}
                          
                          <item.icon className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'}`} />
                          <span className={`font-medium ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                          
                          {/* Active checkmark */}
                          {active && (
                            <div className="ml-auto">
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-4 py-6 border-t border-white/[0.08] space-y-1 shrink-0">
              {bottomItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => { router.push(item.path); handleClose(); }}
                    className={`relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body transition-all duration-300 cursor-pointer ${
                      active
                        ? 'bg-primary/20 text-primary border-2 border-primary shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border border-transparent hover:border-primary/30'
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-gradient-to-b from-primary to-primary/80 rounded-r-full shadow-lg shadow-primary/50" />
                    )}
                    
                    <item.icon className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'}`} />
                    <span className={`font-medium ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                    
                    {/* Active checkmark */}
                    {active && (
                      <div className="ml-auto">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export { PremiumSidebar, PremiumMobileMenu };