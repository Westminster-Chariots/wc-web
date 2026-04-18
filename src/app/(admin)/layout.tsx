"use client";
import { LayoutDashboard, Calendar, Car, Users, FileText, Map, DollarSign, Settings, Shield, ChevronLeft, Menu, Megaphone, User, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives";
import SystemHealth from "@/components/dashboard/SystemHealth";
import AdminNotificationBell from "@/components/dashboard/AdminNotificationBell";
import RouteLoadingBar from "@/components/ui/RouteLoadingBar";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Calendar, label: 'Schedule', path: '/admin/schedule' },
  { icon: Car, label: 'Fleet', path: '/admin/fleet' },
  { icon: Users, label: 'Drivers', path: '/admin/drivers' },
  { icon: FileText, label: 'Manifests', path: '/admin/manifests' },
  { icon: Map, label: 'Live Map', path: '/admin/map' },
  { icon: DollarSign, label: 'Pricing', path: '/admin/pricing' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: Megaphone, label: 'Campaigns', path: '/admin/campaigns' },
];

const bottomItems = [
  { icon: Shield, label: 'Audit Log', path: '/admin/audit' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  return (
    <motion.aside animate={{ width: collapsed ? 72 : 240 }} transition={{ duration: 0.2 }} className="fixed left-0 top-0 h-screen glass-heavy border-r border-white/[0.06] flex flex-col z-50 hidden md:flex">
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <Link href="/">
          <Image src="/assets/wc-logo-white.png" alt="WC" width={32} height={32} className="rounded-md object-contain shrink-0 hover:opacity-80 transition-opacity" />
        </Link>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
              <Link href="/">
                <h1 className="text-sm font-display font-semibold text-foreground tracking-wide">Westminster</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body">Chariots</p>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => router.push(item.path)} 
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body transition-all duration-200 cursor-pointer ${
              isActive(item.path)
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
              isActive(item.path) ? 'text-primary' : ''
            }`} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">{item.label}</motion.span>}
            </AnimatePresence>
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => router.push(item.path)} 
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body transition-all duration-200 cursor-pointer ${
              isActive(item.path)
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
              isActive(item.path) ? 'text-primary' : ''
            }`} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{item.label}</motion.span>}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <div className="px-3 pb-4">
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 font-body transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Collapse</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-muted transition-colors">
        <Menu className="h-5 w-5 text-foreground" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-[260px] glass-heavy border-r border-white/[0.06] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
              <Link href="/" onClick={() => setOpen(false)}>
                <Image src="/assets/wc-logo-white.png" alt="WC" width={32} height={32} className="rounded-md object-contain" />
              </Link>
              <Link href="/" onClick={() => setOpen(false)}>
                <h1 className="text-sm font-display font-semibold text-foreground tracking-wide">Westminster</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-body">Chariots</p>
              </Link>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { router.push(item.path); setOpen(false); }} 
                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body transition-all duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive(item.path) ? 'text-primary' : ''
                  }`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
              {bottomItems.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => { router.push(item.path); setOpen(false); }} 
                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-body transition-all duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive(item.path) ? 'text-primary' : ''
                  }`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <RouteLoadingBar />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="md:ml-[240px] min-h-screen">
        <header className="sticky top-0 z-40 glass-frosted px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <div>
              <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">Command Center</h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <SystemHealth />
            <AdminNotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full gradient-gold flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary">
                  <Image src="/assets/wc-logo-white.png" alt="WC" width={20} height={20} className="object-contain" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/settings")}>
                  <User className="mr-2 h-4 w-4" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => router.push("/auth")}>
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
