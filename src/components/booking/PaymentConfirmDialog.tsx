"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail, Loader2, Eye, Edit3, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: string;
    reservationNumber: string;
    clientName: string | null;
    clientEmail: string | null;
    price: number;
    pickupDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
  };
  onConfirm: (finalPrice: number, paymentLink: string, emailMessage: string) => Promise<void>;
}

export default function PaymentConfirmDialog({ open, onClose, booking, onConfirm }: PaymentConfirmDialogProps) {
  const [price, setPrice] = useState(booking.price);
  const [sending, setSending] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [customMessage, setCustomMessage] = useState(
    `Great news! Your chauffeur is available and ready to serve you. Please complete your payment to finalize your booking.`
  );
  const [emailPreview, setEmailPreview] = useState("");

  // Update preview whenever price, message, or payment link changes
  useEffect(() => {
    const preview = `
    <div style="max-width:600px;margin:0 auto;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Westminster Chariots</h1>
        <p style="margin:8px 0 0;color:#dbeafe;font-size:13px;">Premium Chauffeur Services</p>
      </div>
      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#dbeafe;border-radius:50%;width:56px;height:56px;line-height:56px;margin-bottom:12px;">
            <span style="font-size:28px;">💳</span>
          </div>
          <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">Complete Your Booking</h2>
          <p style="margin:0;color:#64748b;font-size:13px;">Confirmation #: <strong style="color:#1e40af;">${booking.reservationNumber}</strong></p>
        </div>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          Hello <strong>${booking.clientName || 'Valued Client'}</strong>,
        </p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          ${customMessage}
        </p>
        <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0;">
          <h3 style="margin:0 0 12px;color:#1e293b;font-size:14px;font-weight:600;">Trip Details</h3>
          <table style="width:100%;font-size:13px;">
            <tr><td style="padding:6px 0;color:#64748b;">Date & Time</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${booking.pickupDate} at ${booking.pickupTime}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Pickup</td><td style="padding:6px 0;color:#1e293b;">${booking.pickupLocation}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Dropoff</td><td style="padding:6px 0;color:#1e293b;">${booking.dropoffLocation}</td></tr>
          </table>
        </div>
        <div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);border:2px solid #3b82f6;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
          <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;">Total Amount</p>
          <p style="margin:0;color:#1e40af;font-size:32px;font-weight:700;">$${price.toFixed(2)}</p>
          <p style="margin:6px 0 0;color:#64748b;font-size:11px;">Includes gratuity, fees, and tolls</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${paymentLink || '#'}" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 40px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Pay Now - $${price.toFixed(2)}</a>
        </div>
        <p style="margin:20px 0;color:#64748b;font-size:12px;text-align:center;">Secure payment powered by Clover</p>
        <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;margin:20px 0;border-radius:8px;">
          <h3 style="margin:0 0 10px;color:#1e40af;font-size:13px;font-weight:600;">What Happens After Payment</h3>
          <p style="margin:0 0 6px;color:#475569;font-size:12px;line-height:1.6;">✓ You'll receive an instant confirmation email</p>
          <p style="margin:0 0 6px;color:#475569;font-size:12px;line-height:1.6;">✓ Your chauffeur will be assigned and you'll receive their details</p>
          <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">✓ On ride day, your chauffeur will arrive 15 minutes early</p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 10px;color:#1e293b;font-size:13px;font-weight:600;">Need Assistance?</h3>
          <p style="margin:0 0 6px;color:#475569;font-size:12px;">📞 <strong>Phone:</strong> <a href="tel:+15714266338" style="color:#3b82f6;text-decoration:none;">+1 (571) 426-6338</a></p>
          <p style="margin:0 0 6px;color:#475569;font-size:12px;">✉️ <strong>Email:</strong> <a href="mailto:book@westminsterchariots.com" style="color:#3b82f6;text-decoration:none;">book@westminsterchariots.com</a></p>
          <p style="margin:0;color:#475569;font-size:12px;">🕐 <strong>Hours:</strong> 24/7 Customer Support</p>
        </div>
      </div>
      <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;color:#64748b;font-size:11px;">Westminster Chariots · Triangle, VA · Washington DC Metro</p>
        <p style="margin:0;color:#64748b;font-size:11px;">Premium Chauffeur Services Since 2020</p>
      </div>
    </div>
  `;
    setEmailPreview(preview);
  }, [price, customMessage, paymentLink, booking]);

  const handleSend = async () => {
    if (!paymentLink.trim()) {
      toast.error("Please enter a Clover payment link");
      return;
    }

    // Basic URL validation
    try {
      new URL(paymentLink);
    } catch {
      toast.error("Please enter a valid payment link URL");
      return;
    }

    try {
      setSending(true);
      await onConfirm(price, paymentLink, customMessage);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Payment Link Email
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="gap-2">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Content
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-3.5 w-3.5" />
              Preview Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-body">Booking #{booking.reservationNumber}</p>
              <p className="text-sm font-body text-foreground font-semibold">{booking.clientName || "N/A"}</p>
              <p className="text-xs text-muted-foreground font-body">{booking.clientEmail || "N/A"}</p>
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
                Adjust the final price before sending
              </p>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Clover Payment Link *
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://clover.com/payment/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1.5">
                Paste the Clover payment link generated for this booking
              </p>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Email Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                placeholder="Enter custom message for the client..."
              />
              <p className="text-xs text-muted-foreground font-body mt-1.5">
                This message will appear in the email body
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-body font-semibold text-foreground">Email will include:</p>
                  <ul className="text-xs text-muted-foreground font-body mt-1 space-y-0.5 list-disc list-inside">
                    <li>Your custom message</li>
                    <li>Trip details and final price</li>
                    <li>Clover payment link in "Pay Now" button</li>
                    <li>24/7 support contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto py-4">
            <div className="rounded-lg border border-border bg-muted/10 p-4">
              {!paymentLink.trim() && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-body">
                    ⚠️ Payment link is required. The "Pay Now" button will not work without it.
                  </p>
                </div>
              )}
              <div 
                className="bg-white rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{ __html: emailPreview }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={sending} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !paymentLink.trim()} className="flex-1 gap-2">
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
