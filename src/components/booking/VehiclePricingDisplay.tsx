"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Check, ChevronDown, Car } from "lucide-react";
import Image from "next/image";

interface VehiclePricingDisplayProps {
  vehicleType: "sedan" | "suv";
  name: string;
  subtitle: string;
  passengers: number;
  luggage: number;
  image: string;
  features: string[];
  distance: number;
  duration: number;
  price: number | null;
  priceLoading?: boolean;
  taxPercent?: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  vehicleId?: string;
}

// Fallback pricing formulas (same as in usePricing)
const FALLBACK_PRICING = {
  sedan: {
    baseRate: 30,
    ratePerMile: 4.0,
    ratePerMinute: 1.25,
    taxPercent: 20,
  },
  suv: {
    baseRate: 37,
    ratePerMile: 4.5,
    ratePerMinute: 1.55,
    taxPercent: 20,
  },
};

export default function VehiclePricingDisplay({
  vehicleType,
  name,
  subtitle,
  passengers,
  luggage,
  image,
  features,
  distance,
  duration,
  price,
  priceLoading = false,
  taxPercent: propTaxPercent,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  vehicleId,
}: VehiclePricingDisplayProps) {
  const taxPercent = propTaxPercent || FALLBACK_PRICING[vehicleType].taxPercent;
  const tax = price ? price * (taxPercent / 100) : 0;
  const total = price ? price + tax : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div
        onClick={() => {
          onSelect();
        }}
        className={`w-full rounded-xl p-4 sm:p-6 text-left transition-all duration-300 group cursor-pointer ${
          isSelected 
            ? "glass-strong border-primary/40 shadow-blue scale-[1.02]" 
            : "glass-card hover:shadow-blue hover:scale-[1.01] hover:border-primary/30"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="w-full sm:w-32 h-24 sm:h-20 shrink-0 rounded-lg overflow-hidden glass-card relative group-hover:shadow-glass transition-all duration-300">
            <Image src={image} alt={name} fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex items-start justify-between sm:contents">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-display font-semibold text-foreground">{name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {passengers}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {luggage}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-body mt-1 hidden sm:block">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isSelected && (
                <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Selected</span>
                </div>
              )}
              {!priceLoading && price !== null ? (
                <span className={`text-lg sm:text-xl font-display font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  US${total.toFixed(2)}
                </span>
              ) : (
                <div className="h-6 w-20 sm:w-24 rounded bg-secondary animate-pulse" />
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                className="p-1 hover:bg-secondary/50 rounded transition-colors cursor-pointer"
              >
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground font-body mt-2 sm:hidden">{subtitle}</p>
      </div>

      {isExpanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 glass-card rounded-b-xl -mt-1 shadow-glass">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground font-body">{f}</span>
                </div>
              ))}
            </div>
            
            {!priceLoading && price !== null ? (
              <div className="mt-3 sm:mt-4 pt-3 border-t border-border space-y-1.5">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground">Base fare</span>
                  <span className="text-foreground">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
                  <span className="text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-body pt-1.5 border-t border-border">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-primary font-display font-bold text-base">${total.toFixed(2)}</span>
                </div>
                {/* <div className="text-[10px] text-muted-foreground/70 font-body mt-2 pt-2 border-t border-border">
                  <p>Based on {distance.toFixed(1)} miles × {duration} minutes</p>
                  <p className="mt-0.5">Formula: ${FALLBACK_PRICING[vehicleType].baseRate} + (${FALLBACK_PRICING[vehicleType].ratePerMile} × miles) + (${FALLBACK_PRICING[vehicleType].ratePerMinute} × minutes)</p>
                </div> */}
              </div>
            ) : (
              <div className="mt-3 sm:mt-4 pt-3 border-t border-border space-y-1.5">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground">Base fare</span>
                  <span className="text-foreground animate-pulse">Calculating...</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-muted-foreground">Tax ({taxPercent}%)</span>
                  <span className="text-foreground animate-pulse">Calculating...</span>
                </div>
                <div className="flex justify-between text-xs font-body pt-1.5 border-t border-border">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-primary font-display font-bold text-base animate-pulse">Calculating...</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}