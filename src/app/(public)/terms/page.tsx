"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 glass-frosted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/wc-logo-white.png" alt="WC" width={32} height={32} className="object-contain" />
            <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">Westminster Chariots</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-8">Effective Date: March 4, 2026</p>

            <div className="prose prose-sm sm:prose-base max-w-none space-y-8">
              <p className="text-muted-foreground font-body leading-relaxed">
                These Terms & Conditions govern all services provided by Westminster Chariots ("Company," "we," "us," or "our"). By booking or using our services, you ("Client," "Passenger") agree to the following terms.
              </p>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Service Overview</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Westminster Chariots provides pre-arranged luxury ground transportation services. All bookings are subject to availability and confirmation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Booking & Payment</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>A 25% non-refundable deposit is required to secure all reservations.</li>
                  <li>The remaining balance is charged 24 hours prior to the scheduled service.</li>
                  <li>Bookings made within 24 hours of service may require full upfront payment.</li>
                  <li>Additional charges (tolls, wait time, damages, extra stops) may be billed post-service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Cancellation & Refund Policy</h2>
                <div className="glass rounded-lg p-6 border-l-4 border-primary mb-4">
                  <p className="text-sm text-muted-foreground font-body mb-2">
                    <AlertTriangle className="inline h-4 w-4 mr-2 text-primary" />
                    This is where most disputes happen, so it's intentionally precise:
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">More than 24 hours before pickup:</h3>
                    <p className="text-muted-foreground font-body leading-relaxed ml-4">
                      Client may cancel and receive a refund of any amount paid excluding the 25% deposit.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">Within 24 hours of pickup:</h3>
                    <p className="text-muted-foreground font-body leading-relaxed ml-4">
                      The booking becomes non-refundable.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">No-show:</h3>
                    <p className="text-muted-foreground font-body leading-relaxed ml-4">
                      If the client fails to appear at the designated pickup location within the grace period, the ride is marked as a no-show and is fully chargeable.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">Early termination by client:</h3>
                    <p className="text-muted-foreground font-body leading-relaxed ml-4">
                      If the client ends the service early, no partial refunds will be issued.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">Company cancellation:</h3>
                    <p className="text-muted-foreground font-body leading-relaxed ml-4">
                      In rare cases where Westminster Chariots must cancel, a full refund or rescheduling option will be provided.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Waiting Time & Grace Period</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>A 15-minute grace period is provided for standard pickups.</li>
                  <li>After the grace period, wait time charges may apply or the ride may be considered a no-show.</li>
                  <li>Airport pickups include reasonable delay tracking, but excessive delays may incur charges.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Customer Conduct Policy (Strict Enforcement)</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  To maintain a safe, professional, and high-standard environment, the following behavior is strictly prohibited:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4 mb-4">
                  <li>Abusive, threatening, or disrespectful language toward chauffeurs or staff</li>
                  <li>Physical intimidation, harassment, or unsafe conduct</li>
                  <li>Smoking, vaping, or illegal substance use inside the vehicle</li>
                  <li>Excessive intoxication that compromises safety</li>
                  <li>Damage to vehicle interior or exterior</li>
                  <li>Any behavior that distracts or endangers the driver</li>
                </ul>

                <div className="glass rounded-lg p-6 border-l-4 border-destructive">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">Enforcement Actions:</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                    <li>Chauffeurs have full authority to terminate the ride immediately if safety or conduct standards are violated.</li>
                    <li>No refunds will be issued for terminated rides due to misconduct.</li>
                    <li>Clients are financially responsible for any damages, cleaning fees, or repairs.</li>
                    <li>Severe incidents may result in a permanent service ban and, if necessary, law enforcement involvement.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Vehicle Use & Damages</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Clients are responsible for maintaining the condition of the vehicle during use.</li>
                  <li>Any damage, excessive cleaning, or misuse will result in additional charges billed to the client.</li>
                  <li>Minimum cleaning/restoration fees may apply at the Company's discretion.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Liability</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Westminster Chariots is not liable for delays caused by traffic, weather, road conditions, or unforeseen circumstances.</li>
                  <li>Clients are responsible for ensuring adequate travel time.</li>
                  <li>The Company is not responsible for lost or forgotten personal belongings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">8. Right to Refuse Service</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">We reserve the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Refuse service to any individual who poses a safety risk</li>
                  <li>Cancel bookings that violate these terms</li>
                  <li>Enforce all policies at our discretion to maintain service standards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">9. Agreement to Terms</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  By proceeding with your booking, you enter into a service agreement with Westminster Chariots and agree to uphold strict adherence to our cancellation policy and professional conduct standards, which are enforced to protect the integrity of our service.
                </p>
              </section>

              <div className="glass rounded-xl p-6 mt-12 border-l-4 border-primary">
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  These terms are designed to ensure a safe, professional, and premium experience for all parties. By using Westminster Chariots services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
