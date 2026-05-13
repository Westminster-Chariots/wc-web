"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface FloatingCTAProps {
  showBookCTA: boolean;
  isOnLandingPage: boolean;
  ctaSectionRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
}

export default function FloatingCTA({
  showBookCTA,
  isOnLandingPage,
  ctaSectionRef,
  scrollToBookingForm,
}: FloatingCTAProps) {
  const [ctaPosition, setCtaPosition] = useState({ x: 0, y: 0 });
  const [ctaScale, setCtaScale] = useState(1);
  const [ctaOpacity, setCtaOpacity] = useState(1);
  const [shouldShowFloatingCTA, setShouldShowFloatingCTA] = useState(true);

  useEffect(() => {
    const updateCtaPosition = () => {
      if (!ctaSectionRef.current) return;
      
      const ctaSectionRect = ctaSectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate how far into the CTA section we are
      const sectionTop = ctaSectionRect.top;
      const sectionHeight = ctaSectionRect.height;
      
      // When CTA section is in view, animate the floating CTA to merge with it
      if (sectionTop < viewportHeight && sectionTop + sectionHeight > 0) {
        // Calculate progress (0 to 1) of CTA section visibility
        const progress = Math.max(0, Math.min(1, (viewportHeight - sectionTop) / (sectionHeight + viewportHeight)));
        
        // Get the CTA button position in the section
        const ctaButton = ctaSectionRef.current.querySelector('button') as HTMLElement;
        if (ctaButton) {
          const buttonRect = ctaButton.getBoundingClientRect();
          
          // Calculate target position (center of button)
          const targetX = buttonRect.left + buttonRect.width / 2;
          const targetY = buttonRect.top + buttonRect.height / 2;
          
          // Current floating CTA position (center of screen bottom)
          const currentX = viewportWidth / 2;
          const currentY = viewportHeight - 60; // 60px from bottom
          
          // Interpolate position based on progress
          const x = currentX + (targetX - currentX) * progress;
          const y = currentY + (targetY - currentY) * progress;
          
          // Scale down as it approaches the target
          const scale = 1 - (progress * 0.5);
          
          // Fade out as it approaches the target - completely disappear at 80% progress
          const opacity = progress > 0.8 ? 0 : 1 - (progress * 1.25);
          
          // Hide completely when very close to target
          if (progress > 0.8) {
            setShouldShowFloatingCTA(false);
          } else {
            setShouldShowFloatingCTA(true);
          }
          
          setCtaPosition({ x, y });
          setCtaScale(scale);
          setCtaOpacity(opacity);
        }
      } else {
        // Reset to center bottom when CTA section is not in view
        setCtaPosition({ x: viewportWidth / 2, y: viewportHeight - 60 });
        setCtaScale(1);
        setCtaOpacity(1);
        setShouldShowFloatingCTA(true);
      }
    };
    
    window.addEventListener('scroll', updateCtaPosition);
    window.addEventListener('resize', updateCtaPosition);
    updateCtaPosition(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', updateCtaPosition);
      window.removeEventListener('resize', updateCtaPosition);
    };
  }, [ctaSectionRef]);

  return (
    <AnimatePresence>
      {showBookCTA && shouldShowFloatingCTA && (
        <motion.button
          style={{
            position: 'fixed',
            left: `${ctaPosition.x}px`,
            top: `${ctaPosition.y}px`,
            transform: `translate(-50%, -50%) scale(${ctaScale})`,
            opacity: ctaOpacity,
          }}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ 
            opacity: isOnLandingPage ? 0 : ctaOpacity, 
            y: isOnLandingPage ? 100 : 0,
            scale: isOnLandingPage ? 0.8 : ctaScale
          }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          onClick={scrollToBookingForm}
          className="z-50 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-110 transition-transform duration-300 flex items-center gap-2"
        >
          <span>Book Your Ride</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}