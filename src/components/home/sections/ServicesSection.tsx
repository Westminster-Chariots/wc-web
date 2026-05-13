"use client";

import { motion } from "framer-motion";
import { Plane, Clock, Building2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ServicesSection() {
  const services = [
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Airport transfers",
      desc: "Door-to-terminal service for IAD, DCA, and BWI with flight tracking and complimentary wait time.",
      href: "/services#airport-transfer"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "By the hour",
      desc: "Keep your chauffeur for meetings, events, or shopping. Minimum two hours.",
      href: "/services#hourly-car-service"
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Corporate & events",
      desc: "Reliable group transport, roadshows, weddings, and conferences across the DMV.",
      href: "/services#corporate-car-service"
    }
  ];

  return (
    <section id="services" className="border-t border-white/5 px-6 py-24 md:px-14 relative">
      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
            Our Services
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
            A ride for every occasion
          </h2>
          <p className="mt-4 text-foreground/70">
            From airport runs to full-day executive travel, we tailor every journey to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <Link
              key={service.title}
              href={service.href}
              className="group block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/10 bg-card/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-accent-blue-bright/40 hover:bg-card/60 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-blue-gradient inline-flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground">
                    {service.icon}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-foreground/40 group-hover:text-accent-blue-bright transition-colors duration-300" />
                </div>
                <h3 className="mt-6 font-serif text-2xl">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{service.desc}</p>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-accent-blue-bright/20 transition-all duration-300"></div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}