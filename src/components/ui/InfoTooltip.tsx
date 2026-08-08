"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  // One or two short sentences - this is a hint, not documentation. Keep
  // it concise; long help text belongs elsewhere, not in a hover tooltip.
  text: string;
  className?: string;
}

// Small, unobtrusive "i" affordance for admin settings/fields/sections that
// benefit from a one-line explanation. Self-contained (own TooltipProvider)
// so it can be dropped in anywhere without wiring up a page-level provider.
// Deliberately plain (border + solid popover background, no glass/blur) -
// a tooltip is not the place for a heavy visual treatment.
export default function InfoTooltip({ text, className }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-muted-foreground/60 hover:text-primary transition-colors ${className ?? ""}`}
            aria-label="More information"
            onClick={(e) => e.preventDefault()}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-center leading-snug">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
