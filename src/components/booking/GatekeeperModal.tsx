"use client";
import { motion } from "framer-motion";
import { Phone, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { type: "urgent" | "emergency"; onClose: () => void; }

export default function GatekeeperModal({ type, onClose }: Props) {
  const isEmergency = type === "emergency";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-8 card-shadow text-center mx-4">
        <div className={`mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center ${isEmergency ? "bg-destructive/15" : "bg-amber-500/15"}`}>
          {isEmergency ? <AlertTriangle className="h-7 w-7 text-destructive" /> : <Clock className="h-7 w-7 text-amber-400" />}
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">
          {isEmergency ? "Direct Dispatch Required" : "Live Availability Verification"}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">
          {isEmergency
            ? "Trips within 4 hours require direct coordination with our dispatch team to ensure premium service delivery."
            : "Your requested pickup is within the next 12 hours. To guarantee vehicle availability and chauffeur readiness, please contact our dispatch team directly."}
        </p>
        <div className="space-y-3">
          <a href="tel:+15714266338">
            <Button variant="hero" size="lg" className="w-full gap-2"><Phone className="h-4 w-4" />Call Dispatch — (571) 426-6338</Button>
          </a>
          {!isEmergency && <Button variant="heroOutline" size="lg" className="w-full" onClick={onClose}>I'll book for a later time</Button>}
        </div>
        <p className="text-[10px] text-muted-foreground font-body mt-5">Our dispatch team operates 24/7 for your convenience</p>
      </motion.div>
    </motion.div>
  );
}
