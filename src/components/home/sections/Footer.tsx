"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const router = useRouter();
  
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
            <div className="space-y-3 text-sm">
              <a 
                href="tel:+15714266338" 
                className="flex items-center gap-2 text-muted-foreground hover:text-accent-blue-bright transition-all duration-300 group"
              >
                <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>+1 (571) 426-6338</span>
              </a>
              <a 
                href="mailto:info@westminsterchariots.com" 
                className="flex items-center gap-2 text-muted-foreground hover:text-accent-blue-bright transition-all duration-300 group"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>info@westminsterchariots.com</span>
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Washington DC Metro Area</span>
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Our Services</h4>
            <ul className="space-y-3 text-sm">
              {services.map((service) => (
                <li key={service}>
                  <Link 
                    href="/services" 
                    className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent-blue-bright/0 group-hover:bg-accent-blue-bright transition-colors" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Menu</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  href="/fleet" 
                  className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Our Fleet
                </Link>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </a>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-muted-foreground hover:text-accent-blue-bright hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">Get in Touch</h4>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Ready to book your luxury ride? Experience premium chauffeur service.</p>
            <button 
              onClick={() => router.push('/book')}
              className="inline-flex items-center gap-2 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-accent-blue-bright/30 active:scale-95 transition-all duration-300 group"
            >
              Book Now 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-muted-foreground mt-4">Available 24/7 · Instant Confirmation</p>
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
              <Link 
                href="/privacy" 
                className="hover:text-accent-blue-bright transition-all duration-300 hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-accent-blue-bright transition-all duration-300 hover:underline underline-offset-4"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}