"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Users, Briefcase, ShieldCheck, Sparkles, Star, BadgeCheck } from "lucide-react";
import Navigation from "@/components/home/navigation/Navigation";
import Footer from "@/components/home/sections/Footer";
import GoogleReviews from "@/components/GoogleReviews";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { FLEET, type Vehicle } from "@/lib/fleet-data";
import { cn } from "@/lib/utils";

export default function FleetPage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation
        isOnLandingPage={false}
        isScrolled={true}
        isScrollingDown={false}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        isAdmin={isAdmin}
        displayName={displayName}
        handleSignOut={handleSignOut}
        lang={lang}
        cycleLang={cycleLang}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/fleet/fleet-banner-image.png"
            alt="Westminster Chariots luxury fleet lineup"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-20">
          <Navigation
            isOnLandingPage={false}
            isScrolled={false}
            isScrollingDown={false}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            user={user}
            isAdmin={isAdmin}
            displayName={displayName}
            handleSignOut={handleSignOut}
            lang={lang}
            cycleLang={cycleLang}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-24 text-center md:px-14 md:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-white/80">
            Our Luxury Fleet
          </p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] md:text-7xl">
            Luxury. Comfort. Presence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Experience the finest luxury vehicles, premium automobiles and high-end sedans —
            crafted for unmatched comfort on every journey.
          </p>
        </div>
      </div>

      {/* Intro */}
      <section className="border-t border-white/5 px-6 py-20 md:px-14">
        <div className="mx-auto max-w-[1080px] text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
            Crafted for the discerning traveler
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
            A fleet centered around luxurious cars.
          </h2>
          <p className="mt-6 text-foreground/75 md:text-lg">
            At Westminster Chariots, we've built a fleet of executive vehicles and prestige brands
            designed to elevate every mile. Whether you're booking a luxury sedan, a luxurious SUV
            or a limousine sedan, our collection delivers a smooth, professional and comfortable
            ride every time — perfect for any occasion.
          </p>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="relative overflow-hidden border-t border-white/5 bg-card/40 px-6 py-24 md:px-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.19_255_/_0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <div className="mb-14 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              Choose Your Fleet
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              Luxury Sedans &amp; Luxury SUVs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
              From elegant luxury sedans to spacious premium SUVs — every Westminster ride is
              smooth, comfortable and truly exceptional.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {FLEET.map((v) => (
              <VehicleCard key={v.slug} v={v} router={router} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Stands Out */}
      <section className="border-t border-white/5 px-6 py-24 md:px-14">
        <div className="mx-auto grid max-w-[1280px] gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              Why we stand out
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              Why our luxurious cars stand out.
            </h2>
            <p className="mt-6 text-foreground/75">
              Every vehicle in our fleet is carefully selected and flawlessly maintained to deliver
              a first-class travel experience. Fully licensed, insured and serviced regularly to
              ensure absolute safety and reliability.
            </p>
            <p className="mt-4 text-foreground/75">
              We sanitize every vehicle before each trip — giving you a clean, fresh and worry-free
              environment whether you're booking corporate travel, a wedding, an airport transfer
              or VIP-level service.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Feature icon={ShieldCheck} title="Licensed & insured" desc="Full commercial coverage on every ride." />
            <Feature icon={Sparkles} title="Sanitized" desc="Detailed and disinfected before every trip." />
            <Feature icon={BadgeCheck} title="Vetted chauffeurs" desc="Discreet, expert, professionally trained." />
            <Feature icon={Star} title="Immaculate cabins" desc="Late-model interiors kept showroom-fresh." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 bg-card/40 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-14 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              What our clients say
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light md:text-5xl">In their own words.</h2>
          </div>
          <GoogleReviews />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 px-6 py-24 md:px-14">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-background/60 p-10 text-center backdrop-blur-md md:flex-row md:p-14 md:text-left">
          <div>
            <h3 className="font-serif text-3xl font-light md:text-4xl">Ready to travel in style?</h3>
            <p className="mt-3 max-w-xl text-foreground/70">
              Discover why clients choose Westminster Chariots — the finest upscale, chauffeured
              vehicles across Washington DC, Maryland &amp; Virginia.
            </p>
          </div>
          <button
            onClick={() => router.push("/book")}
            className="bg-blue-gradient shadow-blue inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Book your vehicle today <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}


function VehicleCard({ v, router }: { v: Vehicle; router: any }) {
  const [active, setActive] = useState(0);
  const current = v.gallery[active] ?? { src: v.image, label: "Exterior" };
  
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/60 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent-blue-bright/40 hover:shadow-blue">
      <div className="relative aspect-[16/10] overflow-hidden bg-card">
        {v.gallery.map((g, i) => (
          <Image
            key={g.src}
            src={g.src}
            alt={`${v.name} — ${g.label}`}
            fill
            className={cn(
              "object-contain transition-opacity duration-500",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
          {v.name}
        </span>
        <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white backdrop-blur-md">
          {current.label}
        </span>
      </div>

      <div className="flex gap-2 border-b border-white/10 bg-background/40 p-3">
        {v.gallery.map((g, i) => (
          <button
            key={g.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${g.label} of ${v.name}`}
            aria-pressed={i === active}
            className={cn(
              "relative h-16 flex-1 overflow-hidden rounded-lg border transition-all",
              i === active
                ? "border-accent-blue-bright shadow-blue"
                : "border-white/10 opacity-70 hover:opacity-100",
            )}
          >
            <Image
              src={g.src}
              alt=""
              fill
              className={
                 g.src === "/assets/fleet/2027-s-class.png"
                ? "object-contain"
                 : "object-cover"
              }
              ></Image>
          </button>
        ))}
      </div>
      
      <div className="p-6">
        <h3 className="font-serif text-2xl">{v.category}</h3>
        <p className="mt-2 text-sm text-foreground/65 leading-relaxed">{v.description}</p>

        <div className="mt-5 flex items-center gap-5 border-t border-white/10 pt-5 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-blue-bright" />
            <span>
              <span className="font-semibold">{v.passengers}</span> passengers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent-blue-bright" />
            <span>
              <span className="font-semibold">{v.luggage}</span> luggage
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push("/book")}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-blue-bright group"
        >
          Reserve this vehicle{" "}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 p-5 backdrop-blur-md">
      <Icon className="h-6 w-6 text-accent-blue-bright" />
      <div className="mt-3 font-serif text-lg">{title}</div>
      <p className="mt-1 text-sm text-foreground/65">{desc}</p>
    </div>
  );
}


