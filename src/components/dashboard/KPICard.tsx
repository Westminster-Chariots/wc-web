"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export default function KPICard({ title, value, subtitle, icon: Icon, accentColor }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="glass rounded-xl p-3 sm:p-5 relative overflow-hidden group cursor-default border border-white/[0.06]"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground font-body">
            {title}
          </p>
          <p className={`text-xl sm:text-3xl font-display font-bold ${accentColor || 'text-foreground'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg glass p-2.5 border border-white/[0.06]">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
