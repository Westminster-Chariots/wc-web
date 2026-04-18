"use client";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountHeaderProps {
  onSignOut: () => void;
}

export default function AccountHeader({ onSignOut }: AccountHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-frosted border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-foreground">
          Westminster Chariots
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </header>
  );
}
