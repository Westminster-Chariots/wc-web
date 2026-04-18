"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden glass-specular flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur shrink-0">
          <h2 className="text-xl font-display font-semibold text-foreground">Terms & Conditions</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto font-body text-sm text-muted-foreground space-y-5">
          {[
            ["1. Introduction", "By placing a booking with Westminster Chariots, you agree to the following terms and conditions."],
            ["2. Cancellations & Modifications", "Cancellations 24+ hours prior: no penalty. Within 12–24 hours: 50% charge. Under 12 hours or no-shows: 100% charge."],
            ["3. Wait Time Policy", "Airport pickups: 60 min complimentary (international), 30 min (domestic). Standard pickups: 15 min grace period. After grace period: $95/hr billed in 15-min increments."],
            ["4. Cleaning & Damage Fees", "Clients assume full financial responsibility for vehicle damage. Up to $300 for excessive cleaning requirements."],
            ["5. Conduct & Safety", "No smoking of any kind. No alcohol for minors. Chauffeur may terminate trip without refund for unsafe behavior."],
            ["6. Liability", "Westminster Chariots is not liable for items left in the vehicle or delays caused by conditions beyond our control."],
          ].map(([title, body]) => (
            <div key={title}><h3 className="text-foreground font-semibold mb-2">{title}</h3><p>{body}</p></div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-card/50 backdrop-blur shrink-0 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">I Understand</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
