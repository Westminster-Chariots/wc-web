"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Shield, DollarSign, Clock, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Join Our Team
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed mb-12">
              Westminster Chariots is seeking professional chauffeurs who embody discretion, punctuality, and excellence. If you take pride in delivering exceptional service and maintaining the highest standards, we invite you to join our distinguished team.
            </p>

            <div className="my-12 rounded-xl overflow-hidden">
              <Image 
                src="/assets/chauffeur-service.jpg" 
                alt="Professional chauffeur" 
                width={1200} 
                height={600} 
                className="w-full h-auto"
              />
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Why Drive with Westminster Chariots?</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: DollarSign, title: "Competitive Compensation", desc: "Industry-leading pay with performance bonuses" },
                  { icon: Clock, title: "Flexible Schedule", desc: "Choose shifts that work for your lifestyle" },
                  { icon: Car, title: "Premium Fleet", desc: "Drive luxury vehicles maintained to perfection" },
                  { icon: Users, title: "Professional Environment", desc: "Serve distinguished clientele in the DMV area" },
                  { icon: Shield, title: "Full Support", desc: "Comprehensive training and ongoing assistance" },
                  { icon: DollarSign, title: "Benefits Package", desc: "Health insurance and retirement options available" },
                ].map((item) => (
                  <div key={item.title} className="glass rounded-xl p-6">
                    <item.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Requirements</h2>
              <div className="glass rounded-xl p-6 sm:p-8">
                <ul className="space-y-3 text-muted-foreground font-body">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Valid driver's license with clean driving record (minimum 3 years)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Commercial driver's license (CDL) or willingness to obtain</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Professional appearance and demeanor</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Excellent knowledge of DC Metropolitan Area geography</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Strong communication and customer service skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Ability to maintain confidentiality and discretion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Pass comprehensive background check and drug screening</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Smartphone proficiency for navigation and dispatch systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Flexibility to work evenings, weekends, and holidays as needed</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">What We Value</h2>
              <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                <p>
                  At Westminster Chariots, we don't just hire drivers—we select professionals who understand that every journey represents our commitment to excellence. Our chauffeurs are ambassadors of our brand, embodying the values of punctuality, discretion, and impeccable service.
                </p>
                <p>
                  We seek individuals who take pride in their work, maintain composure under pressure, and understand that the finest service is delivered with quiet confidence and attention to detail.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Application Process</h2>
              <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li>Submit your application and resume via email</li>
                  <li>Initial phone screening with our recruitment team</li>
                  <li>In-person interview and driving assessment</li>
                  <li>Background check and reference verification</li>
                  <li>Comprehensive training program</li>
                  <li>Begin your career with Westminster Chariots</li>
                </ol>
              </div>
            </section>

            <div className="glass rounded-xl p-8 text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">Ready to Apply?</h2>
              <p className="text-muted-foreground font-body mb-6 max-w-2xl mx-auto">
                Send your resume and a brief cover letter explaining why you'd be an excellent fit for Westminster Chariots.
              </p>
              <Button 
                variant="hero" 
                size="lg" 
                className="gap-2"
                onClick={() => window.location.href = 'mailto:careers@westminsterchariots.com?subject=Chauffeur Application'}
              >
                <Mail className="h-4 w-4" />
                Apply Now
              </Button>
              <p className="text-sm text-muted-foreground font-body mt-4">
                Email: <a href="mailto:careers@westminsterchariots.com" className="text-primary hover:underline">careers@westminsterchariots.com</a>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground font-body text-center">
                Westminster Chariots is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
