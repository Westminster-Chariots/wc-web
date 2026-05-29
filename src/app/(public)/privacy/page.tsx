"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SimpleNavigation from "@/components/home/navigation/SimpleNavigation";
import Footer from "@/components/home/sections/Footer";

export default function PrivacyPage() {
  return (
    <>
      <SimpleNavigation />
      <div className="min-h-screen bg-background">

      <main className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-8">Last Updated: January 1, 2026</p>

            <div className="prose prose-sm sm:prose-base max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Westminster Chariots ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services or visit our website.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed">
                  By using our services, you agree to the practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-display font-semibold text-foreground mb-3 mt-6">a. Personal Information</h3>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">We may collect the following:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Billing and payment details</li>
                  <li>Pickup and drop-off addresses</li>
                  <li>Trip history and booking preferences</li>
                </ul>

                <h3 className="text-xl font-display font-semibold text-foreground mb-3 mt-6">b. Automatically Collected Information</h3>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">When you use our website, we may collect:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>IP address</li>
                  <li>Browser type and device information</li>
                  <li>Pages visited and usage behavior</li>
                  <li>Cookies and tracking data</li>
                </ul>

                <h3 className="text-xl font-display font-semibold text-foreground mb-3 mt-6">c. Payment Information</h3>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Payments are processed securely through third-party providers. We do not store full payment card details on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Process and manage bookings</li>
                  <li>Communicate confirmations, updates, and support</li>
                  <li>Provide customer service and respond to inquiries</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Detect and prevent fraud or unauthorized activity</li>
                  <li>Comply with legal and regulatory obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Sharing of Information</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">
                  We do not sell or rent your personal information.
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Trusted service providers (e.g., payment processors, booking systems)</li>
                  <li>Chauffeurs or dispatch personnel as necessary to fulfill your service</li>
                  <li>Legal authorities if required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Cookies & Tracking Technologies</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Our website uses cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Enhance user experience</li>
                  <li>Remember preferences</li>
                  <li>Analyze site traffic and performance</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mt-3">
                  You may disable cookies through your browser settings, though some features may not function properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Data Security</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">We retain personal information only as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Provide services</li>
                  <li>Maintain business records</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">8. Your Rights & Choices</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">Depending on your location, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body ml-4">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                <p className="text-muted-foreground font-body leading-relaxed mt-3">
                  To exercise these rights, contact us using the information below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">9. Third-Party Services</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Our website may integrate third-party services (e.g., maps, payment gateways, analytics tools). These services operate under their own privacy policies, and we are not responsible for their practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">11. Confidentiality Commitment</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  As a premium chauffeur service, Westminster Chariots maintains strict discretion. All client interactions, travel details, and personal information are treated as confidential and private.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">12. Changes to This Policy</h2>
                <p className="text-muted-foreground font-body leading-relaxed">
                  We may update this Privacy Policy periodically. Updates will be posted on this page with a revised effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground font-body leading-relaxed mb-3">
                  For questions or requests regarding this Privacy Policy:
                </p>
                <div className="glass rounded-lg p-6">
                  <p className="text-foreground font-body font-semibold mb-2">Westminster Chariots</p>
                  <p className="text-muted-foreground font-body">Email: <a href="mailto:admin@westminsterchariots.com" className="text-primary hover:underline">admin@westminsterchariots.com</a></p>
                  <p className="text-muted-foreground font-body">Website: <a href="https://www.westminsterchariots.com" className="text-primary hover:underline">www.westminsterchariots.com</a></p>
                </div>
              </section>

              <div className="glass rounded-xl p-6 mt-12 border-l-4 border-primary">
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  By using the services of Westminster Chariots or accessing our website, you acknowledge and agree to the terms outlined in this Privacy Policy. We are committed to protecting your personal information with the highest standards of security, discretion, and professionalism.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
