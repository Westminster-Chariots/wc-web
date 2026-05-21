"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PremiumKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

export default function PremiumKPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  accentColor,
  trend 
}: PremiumKPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative group cursor-default"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/2 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main card */}
      <div className="relative glass-strong rounded-2xl p-5 border border-white/[0.12] shadow-glass-elevated hover:shadow-glass-elevated-hover transition-all duration-300 overflow-hidden">
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl bg-background" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground font-body">
                {title}
              </p>
              <p className={`text-2xl sm:text-3xl font-display font-bold ${accentColor || 'text-foreground'}`}>
                {value}
              </p>
            </div>
            
            {/* Premium icon container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative glass rounded-xl p-3 border border-white/[0.15] shadow-sm group-hover:shadow-blue/20 transition-all duration-300">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          
          {/* Subtitle and trend */}
          <div className="flex items-center justify-between">
            {subtitle && (
              <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
            )}
            
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium font-body ${
                trend.positive 
                  ? 'bg-emerald-500/10 text-emerald-600' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                <span className={trend.positive ? 'text-emerald-500' : 'text-destructive'}>
                  {trend.positive ? '↗' : '↘'}
                </span>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground ml-1">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
      </div>
    </motion.div>
  );
}