"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives";
import SystemHealth from "@/components/dashboard/SystemHealth";
import AdminNotificationBell from "@/components/dashboard/AdminNotificationBell";
import RouteLoadingBar from "@/components/ui/RouteLoadingBar";
import { useAuth } from "@/hooks/useAuth";
import { PremiumSidebar, PremiumMobileMenu } from "./PremiumSidebar";
import { User, Settings, LogOut, Bell, BarChart3, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">Access Denied</h1>
            <p className="text-sm text-muted-foreground font-body">
              You do not have permission to access the admin panel. This area is restricted to administrators only.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to Homepage
            </button>
            {user && (
              <button
                onClick={() => router.push("/account")}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-foreground font-body text-sm font-semibold hover:bg-muted transition-colors"
              >
                Go to Account
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RouteLoadingBar />
      <PremiumSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="md:ml-[280px] min-h-screen">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg px-6 md:px-8 py-5 flex items-center justify-between border-b border-white/[0.12] shadow-lg">
          <div className="flex items-center gap-4">
            <PremiumMobileMenu />
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Command Center</h2>
              <p className="text-sm text-muted-foreground font-body mt-1 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {/* <SystemHealth /> */}
            <AdminNotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full glass border border-white/[0.15] flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-105 transition-transform duration-300 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Image src="/assets/wc-logo-no-motto.png" alt="WC" width={24} height={24} className="relative object-contain" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong border border-white/[0.12] shadow-glass-elevated backdrop-blur-xs">
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground font-body">Signed in as</p>
                  <p className="text-sm font-semibold text-foreground font-body truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => router.push("/admin/settings")}>
                  <User className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="font-body">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => router.push("/admin/settings")}>
                  <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="font-body">Settings</span>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => router.push("/admin/audit")}>
                  <BarChart3 className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="font-body">Analytics</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem className="cursor-pointer py-2.5 text-destructive" onClick={() => router.push("/auth")}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-body">Logout</span>
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
