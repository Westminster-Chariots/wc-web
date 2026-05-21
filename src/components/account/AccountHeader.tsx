"use client";
import Image from "next/image";
import Link from "next/link";
import { Car, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountHeaderProps {
  onSignOut: () => void;
}

export default function AccountHeader({ onSignOut }: AccountHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 font-display font-semibold text-slate-900">
          <div className="relative h-10 w-10 overflow-hidden bg-slate-100 shadow-sm">
            <Image src="/assets/wc-logo-no-motto.png" alt="Westminster Chariots" fill className="object-contain" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Westminster Chariots</p>
            <p className="text-xs text-slate-400">Member center</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/book">
            <Button variant="cta" size="sm" className="gap-2">
              <Car className="h-4 w-4" /> Book New Ride
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="gap-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
