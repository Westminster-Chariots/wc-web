"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Users, 
  Car, 
  Shield, 
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Navigation from "@/components/home/navigation/Navigation";
import Footer from "@/components/home/sections/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const faqs = [
  {
    category: "Booking & Reservations",
    icon: Calendar,
    questions: [
      {
        q: "How do I book a ride?",
        a: "You can book a ride through our website by clicking 'Book Now', selecting your pickup and dropoff locations, choosing your date and time, and completing the payment. You'll receive instant confirmation via email."
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 24 hours in advance for guaranteed availability. However, we also accept last-minute bookings based on chauffeur availability. For airport transfers and special events, we suggest booking 48-72 hours ahead."
      },
      {
        q: "Can I modify or cancel my booking?",
        a: "Yes, you can modify or cancel your booking up to 24 hours before your scheduled pickup time without penalty. Cancellations within 24 hours may incur a fee. Contact us at (571) 426-6338 or email info@westminsterchariots.com."
      },
      {
        q: "Do you offer hourly bookings?",
        a: "Yes, we offer hourly charter services with a minimum of 3 hours. This is perfect for business meetings, city tours, or events where you need the vehicle to wait for you."
      }
    ]
  },
  {
    category: "Pricing & Payment",
    icon: CreditCard,
    questions: [
      {
        q: "How is pricing calculated?",
        a: "Our pricing is based on distance, duration, and vehicle type. Sedans start at $95, SUVs at $125, and Sprinter vans at $195. All prices include gratuity, tolls, and fees. You'll see the exact price before confirming your booking."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment system. Corporate accounts can also be invoiced monthly."
      },
      {
        q: "Are gratuity and tolls included?",
        a: "Yes, all our prices are all-inclusive. Gratuity for the chauffeur and any tolls or parking fees are already included in the quoted price."
      },
      {
        q: "Do you offer corporate accounts?",
        a: "Yes, we offer dedicated corporate accounts with monthly billing, volume discounts, and a dedicated account manager. Contact us to set up your corporate account."
      }
    ]
  },
  {
    category: "Service & Vehicles",
    icon: Car,
    questions: [
      {
        q: "What vehicles are in your fleet?",
        a: "Our fleet consists of Mercedes-Benz S-Class sedans (3 passengers), GLS SUVs (6 passengers), and Sprinter vans (14 passengers). All vehicles are late-model, meticulously maintained, and equipped with premium amenities."
      },
      {
        q: "What amenities are included?",
        a: "All vehicles include complimentary WiFi, bottled water, phone chargers, climate control, and premium sound systems. Our chauffeurs are professional, licensed, and uniformed."
      },
      {
        q: "Do you provide car seats for children?",
        a: "Yes, we can provide car seats and booster seats upon request. Please specify your needs when booking, including the child's age and weight."
      },
      {
        q: "Are your chauffeurs licensed and insured?",
        a: "Absolutely. All our chauffeurs are fully licensed, background-checked, and insured. They undergo regular training and have extensive knowledge of the DC metro area."
      }
    ]
  },
  {
    category: "Airport Transfers",
    icon: MapPin,
    questions: [
      {
        q: "Which airports do you serve?",
        a: "We serve all major airports in the DC metro area including Reagan National (DCA), Dulles International (IAD), and Baltimore-Washington International (BWI)."
      },
      {
        q: "Do you track flight delays?",
        a: "Yes, we monitor all flights in real-time. If your flight is delayed, your chauffeur will adjust the pickup time automatically at no extra charge."
      },
      {
        q: "How does airport pickup work?",
        a: "For airport pickups, your chauffeur will meet you at the designated meeting point (we'll provide details in your confirmation email). They'll monitor your flight and be there when you land. We include 15 minutes of complimentary wait time."
      },
      {
        q: "What is your wait time policy?",
        a: "We provide 15 minutes of complimentary wait time for all pickups. After that, wait time is charged at $95/hour. For airport pickups, we track your flight and adjust accordingly."
      }
    ]
  },
  {
    category: "Policies & Safety",
    icon: Shield,
    questions: [
      {
        q: "What is your cancellation policy?",
        a: "Free cancellation up to 24 hours before pickup. Cancellations within 24 hours incur a 50% fee. No-shows are charged the full amount."
      },
      {
        q: "Are your vehicles sanitized?",
        a: "Yes, all vehicles are thoroughly cleaned and sanitized between each trip. We follow strict hygiene protocols to ensure your safety and comfort."
      },
      {
        q: "What if I need to make a stop during my trip?",
        a: "Additional stops can be added during booking or requested during your trip. Each stop includes 5 minutes of complimentary wait time. Extended stops may incur additional charges."
      },
      {
        q: "Do you operate 24/7?",
        a: "Yes, Westminster Chariots operates 24 hours a day, 7 days a week, including holidays. We're always available when you need us."
      }
    ]
  }
];

const contactOptions = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak with our team",
    action: "+1 (571) 426-6338",
    href: "tel:+15714266338",
    available: "24/7 Available"
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us a message",
    action: "info@westminsterchariots.com",
    href: "mailto:info@westminsterchariots.com",
    available: "Response within 2 hours"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with support",
    action: "Start Chat",
    href: "#contact",
    available: "Mon-Fri, 9am-6pm"
  }
];

export default function HelpPage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

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
      <section className="relative pt-32 pb-20 px-6 md:px-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue-bright/5 via-transparent to-accent-gold/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent-blue-bright/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue-bright/10 border border-accent-blue-bright/20 mb-6 animate-fade-in-up">
            <HelpCircle className="h-4 w-4 text-accent-blue-bright" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent-blue-bright">Support Center</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            How Can We Help?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Find answers to common questions or get in touch with our support team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue-bright focus:ring-2 focus:ring-accent-blue-bright/20 transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-12 px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <a
                key={option.title}
                href={option.href}
                className="glass-card rounded-2xl border border-white/10 p-6 hover:border-accent-blue-bright/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue-bright/20 group animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-blue-bright/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <option.icon className="h-6 w-6 text-accent-blue-bright" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                    <p className="text-sm font-medium text-accent-blue-bright group-hover:underline">
                      {option.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{option.available}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-blue-bright opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 px-6 md:px-14">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright mb-4">
              Frequently Asked Questions
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight">
              Find Your Answers
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-blue-gradient text-white shadow-blue"
                  : "bg-white/50 text-foreground hover:bg-white/80 border border-white/20"
              }`}
            >
              All Topics
            </button>
            {faqs.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.category
                    ? "bg-blue-gradient text-white shadow-blue"
                    : "bg-white/50 text-foreground hover:bg-white/80 border border-white/20"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-6">
            {(searchQuery ? filteredFAQs : selectedCategory ? faqs.filter(c => c.category === selectedCategory) : faqs).map((category) => (
              <div key={category.category} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent-blue-bright/10 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-accent-blue-bright" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.category}</h3>
                </div>

                {category.questions.map((faq, index) => {
                  const faqId = `${category.category}-${index}`;
                  const isOpen = openFAQ === faqId;

                  return (
                    <div
                      key={faqId}
                      className="glass-card rounded-xl border border-white/10 overflow-hidden hover:border-accent-blue-bright/30 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleFAQ(faqId)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium pr-4">{faq.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-accent-blue-bright flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-20 px-6 md:px-14">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl border border-white/10 p-12 hover:border-accent-blue-bright/30 transition-all duration-500">
          <Sparkles className="h-12 w-12 text-accent-blue-bright mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+15714266338"
              className="inline-flex items-center gap-2 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-accent-blue-bright/30 active:scale-95 transition-all duration-300 group"
            >
              <Phone className="h-4 w-4" />
              Call (571) 426-6338
            </a>
            <a
              href="mailto:info@westminsterchariots.com"
              className="inline-flex items-center gap-2 bg-white/50 hover:bg-white/80 border border-white/20 rounded-full px-8 py-4 text-sm font-semibold text-foreground hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
