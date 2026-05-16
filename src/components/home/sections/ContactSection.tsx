"use client";

import { ArrowRight } from "lucide-react";

interface ContactSectionProps {
  scrollToBookingForm: () => void;
}

export default function ContactSection({ scrollToBookingForm }: ContactSectionProps) {
  return (
    <section id="contact" className="border-t border-white/5 px-6 py-24 md:px-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
            Get in Touch
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
            Contact Westminster Chariots
          </h2>
          <p className="mt-4 text-foreground/70">
            Have questions or ready to book? Reach out to our team for personalized service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  {/* <div>
                    <p className="font-medium text-foreground mb-1">Address</p>
                    <p>18750 Fuller Height Rd, Triangle, VA</p>
                  </div> */}
                  <div>
                    <p className="font-medium text-foreground mb-1">Phone</p>
                    <a href="tel:+15714266338" className="hover:text-foreground transition-colors">+1 (571) 426-6338</a>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Email</p>
                    <a href="mailto:info@westminsterchariots.com" className="hover:text-foreground transition-colors">info@westminsterchariots.com</a>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Hours</p>
                    <p>24/7 Service Available</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Service Areas</h3>
                <p className="text-sm text-muted-foreground">
                  Serving the entire Washington DC Metropolitan Area including:
                  Northern Virginia, Maryland, and surrounding regions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="glass-card rounded-2xl border border-white/10 p-8 backdrop-blur-md">
            <h3 className="text-lg font-display font-semibold text-foreground mb-6">Send us a message</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground/60 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/60 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-400 transition-colors resize-none"
                  placeholder="Tell us about your transportation needs..."
                />
              </div>
              
              <button 
                onClick={scrollToBookingForm}
                className="w-full bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Message <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}