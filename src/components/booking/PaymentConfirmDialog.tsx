"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: string;
    reservationNumber: string;
    clientName: string;
    clientEmail: string;
    price: number;
    pickupDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
  };
  onConfirm: (finalPrice: number) => Promise<void>;
}

export default function PaymentConfirmDialog({ open, onClose, booking, onConfirm }: PaymentConfirmDialogProps) {
  const [price, setPrice] = useState(booking.price);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    try {
      setSending(true);
      await onConfirm(price);
      toast.success("Payment link sent to client");
      onClose();
    } catch (error) {
      toast.error("Failed to send payment link");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm & Send Payment Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-body">Booking #{booking.reservationNumber}</p>
            <p className="text-sm font-body text-foreground">{booking.clientName}</p>
            <p className="text-xs text-muted-foreground font-body">{booking.clientEmail}</p>
            <p className="text-xs text-muted-foreground font-body mt-2">
              {booking.pickupDate} at {booking.pickupTime}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {booking.pickupLocation} → {booking.dropoffLocation}
            </p>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-foreground mb-2">
              Final Price (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1.5">
              Review and adjust the price before sending the payment link
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-body font-semibold text-foreground">Email will include:</p>
                <ul className="text-xs text-muted-foreground font-body mt-1 space-y-0.5 list-disc list-inside">
                  <li>Trip details and final price</li>
                  <li>Secure Stripe payment link</li>
                  <li>Booking confirmation upon payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={sending} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="flex-1 gap-2">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Payment Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
