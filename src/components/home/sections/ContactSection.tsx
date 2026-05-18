"use client";

import { ArrowRight, Mail, Phone, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { notify } from "@/lib/notify";

interface ContactSectionProps {
  scrollToBookingForm: () => void;
}

export default function ContactSection({ scrollToBookingForm }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      notify.error("Please fill in all fields");
      return;
    }

    if (formData.message.length < 10) {
      notify.error("Message must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        notify.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      } else {
        notify.error(data.error || "Failed to send message");
      }
    } catch (error) {
      notify.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
          <div className="space-y-8">
            <div className="group">
              <h3 className="text-lg font-display font-semibold text-foreground mb-6">Contact Information</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent-blue-bright/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue-bright/10">
                  <div className="p-2 rounded-lg bg-accent-blue-bright/10">
                    <Phone className="h-5 w-5 text-accent-blue-bright" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1 text-sm">Phone</p>
                    <a href="tel:+15714266338" className="text-muted-foreground hover:text-accent-blue-bright transition-colors text-sm">+1 (571) 426-6338</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent-blue-bright/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue-bright/10">
                  <div className="p-2 rounded-lg bg-accent-blue-bright/10">
                    <Mail className="h-5 w-5 text-accent-blue-bright" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1 text-sm">Email</p>
                    <a href="mailto:info@westminsterchariots.com" className="text-muted-foreground hover:text-accent-blue-bright transition-colors text-sm">info@westminsterchariots.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent-blue-bright/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue-bright/10">
                  <div className="p-2 rounded-lg bg-accent-blue-bright/10">
                    <Clock className="h-5 w-5 text-accent-blue-bright" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1 text-sm">Hours</p>
                    <p className="text-muted-foreground text-sm">24/7 Service Available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-accent-blue-bright/10 to-accent-gold/10 border border-white/10">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="h-5 w-5 text-accent-blue-bright mt-0.5" />
                <h3 className="text-lg font-display font-semibold text-foreground">Service Areas</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Serving the entire Washington DC Metropolitan Area including Northern Virginia, Maryland, and surrounding regions.
              </p>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="glass-card rounded-2xl border border-white/10 p-8 backdrop-blur-md hover:border-accent-blue-bright/30 transition-all duration-500">
            <h3 className="text-lg font-display font-semibold text-foreground mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-medium text-foreground/60 mb-2 group-focus-within:text-accent-blue-bright transition-colors">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-blue-bright focus:ring-2 focus:ring-accent-blue-bright/20 transition-all duration-300"
                    placeholder="John"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-medium text-foreground/60 mb-2 group-focus-within:text-accent-blue-bright transition-colors">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-blue-bright focus:ring-2 focus:ring-accent-blue-bright/20 transition-all duration-300"
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-medium text-foreground/60 mb-2 group-focus-within:text-accent-blue-bright transition-colors">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-blue-bright focus:ring-2 focus:ring-accent-blue-bright/20 transition-all duration-300"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="group">
                <label className="block text-xs font-medium text-foreground/60 mb-2 group-focus-within:text-accent-blue-bright transition-colors">Message</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-blue-bright focus:ring-2 focus:ring-accent-blue-bright/20 transition-all duration-300 resize-none"
                  placeholder="Tell us about your transportation needs..."
                  disabled={isSubmitting}
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}