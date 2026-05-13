"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const services = [
    "Airport Transfer",
    "Corporate Car Service",
    "Hourly Car Service",
    "Long Distance Car Service",
    "Night out",
    "Concert Transportation",
    "Transportation for Wedding",
    "City Tours",
    "Prom Limo Service",
    "Date Night"
  ];

  return (
    <footer className="border-t border-white/5 py-16 bg-background px-6 md:px-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Contact Info */}
          <div>
            <div className="mb-6">
              <Image 
                src="/assets/wc-logo-no-motto.png" 
                alt="Westminster Chariots" 
                width={240} 
                height={80} 
                className="object-contain h-16 w-auto" 
              />
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>18750 Fuller Height Rd, Triangle, VA</p>
              <p>
                <a href="tel:+15714266338" className="hover:text-foreground transition-colors">+1 (571) 426-6338</a>
              </p>
              <p>
                <a href="mailto:book@westminsterchariots.com" className="hover:text-foreground transition-colors">book@westminsterchariots.com</a>
              </p>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Our Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {services.map((service) => (
                <li key={service}>
                  <a href="/services" className="hover:text-foreground transition-colors">{service}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Menu</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="#services" className="hover:text-foreground transition-colors">Services</Link></li>
              <li><Link href="#fleet" className="hover:text-foreground transition-colors">Our Fleet</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Get in Touch</h4>
            <p className="text-sm text-muted-foreground mb-4">Ready to book your luxury ride?</p>
            <button 
              onClick={() => {
                const bookingForm = document.getElementById("booking-form");
                bookingForm?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300"
            >
              Book Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="text-center md:text-left">
              <span>Copyright © {new Date().getFullYear()} Westminster Chariots</span>
              <span className="hidden md:inline mx-2">·</span>
              <span className="block md:inline mt-2 md:mt-0">Powered by Hashmat</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}