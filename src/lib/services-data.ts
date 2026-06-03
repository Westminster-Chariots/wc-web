export type ServiceDetail = {
  slug: string;
  title: string;
  tagline: string;
  shortDesc: string;
  longDesc: string;
  image: string; // Used for service card/widget on listing page
  bannerImage: string; // Optional banner image for service listing page
  detailImage: string; // Used for hero banner on detail page
  highlights: { title: string; desc: string }[];
  benefits: string[];
  faqs: { q: string; a: string }[];
};

export const SERVICES: ServiceDetail[] = [
  {
    slug: "airport-transfers",
    title: "Washington DC Airport Transfers",
    tagline: "Arrive composed. Depart on time.",
    shortDesc:
      "Flight-tracked pickups to DCA, IAD, BWI, RIC and beyond — your chauffeur is waiting before you land.",
    longDesc:
      "Reliable, stress-free airport transportation to and from DCA, IAD, BWI, Richmond (RIC), Manassas (HEF) and Stafford (RMN). Professional chauffeurs track your flight, monitor traffic, and assist with luggage — every step is built around an effortless arrival or departure.",
    image: "/assets/services/airport-transfers.png",
    bannerImage: "/assets/services/airport-transfers-client.png",
    detailImage: "/assets/services/everything-you-need-section.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Live flight tracking", desc: "We adjust your pickup automatically — early arrivals, delays, gate changes." },
      { title: "Complimentary wait time", desc: "Up to 60 minutes after landing, so you never feel rushed off the plane." },
      { title: "Meet & greet on request", desc: "Your chauffeur waits inside with a name placard and helps with bags." },
    ],
    benefits: [
      "Sedan, SUV or Sprinter to match party size and luggage",
      "Trained, uniformed chauffeurs with airport credentials",
      "Real-time trip tracking shared with travelers or assistants",
      "Flat-rate pricing — no surge, no surprises",
    ],
    faqs: [
      { q: "Which airports do you serve?", a: "DCA, IAD and BWI as primary airports, plus RIC, HEF and RMN. We also handle private terminals (FBOs)." },
      { q: "What if my flight is delayed?", a: "We track every flight in real time and automatically adjust your pickup — at no additional charge within the first hour." },
      { q: "Will the chauffeur help with luggage?", a: "Yes. Every chauffeur assists with luggage curbside and at your destination." },
    ],
  },
  {
    slug: "corporate-car-service",
    title: "Corporate Car Service",
    tagline: "Travel that reflects your standards.",
    shortDesc: "Discreet, punctual executive transport across the DMV — built for boards, clients and back-to-back meetings.",
    longDesc:
      "Professional, on-time and confidential ground transportation for executives, visiting clients and corporate events throughout Washington DC, Maryland and Virginia. Our chauffeurs know the metro intimately and treat your time, and your guests, with the discretion they expect.",
    image: "/assets/services/corporate-transfers.png",
    bannerImage: "/assets/services/corporate-transfers.png",
    detailImage: "/assets/services/corporate-transfers.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Account billing", desc: "Centralized monthly invoicing with cost-center and traveler tagging." },
      { title: "Dedicated coordinators", desc: "A single point of contact for road shows, conferences and recurring runs." },
      { title: "Vetted chauffeurs", desc: "Background-checked, NDA-compliant, and trained in executive protocol." },
    ],
    benefits: [
      "Executive sedans, SUVs and Sprinters",
      "24/7 dispatch and priority support",
      "Custom traveler policies for compliance",
      "Real-time visibility for travel managers",
    ],
    faqs: [
      { q: "Can we set up a corporate account?", a: "Yes — most accounts are active within 48 hours, with monthly invoicing and dedicated support." },
      { q: "Do you handle multi-vehicle road shows?", a: "Routinely. We coordinate fleets across the DMV with a single operations lead." },
      { q: "Is the service confidential?", a: "All chauffeurs sign NDAs and follow strict executive protocol standards." },
    ],
  },
  {
    slug: "hourly-car-service",
    title: "Hourly Car Service",
    tagline: "Your chauffeur, on standby.",
    shortDesc: "Keep a sedan or SUV at your command for meetings, errands or a full day of moving through the city.",
    longDesc:
      "Complete flexibility for your day. Whether it's back-to-back meetings, a personal schedule or a VIP itinerary, your chauffeur stays with you across Washington DC, Maryland and Virginia — productive between stops, ready at every doorstep.",
    image: "/assets/services/hourly-car-service.png",
    bannerImage: "/assets/services/hourly-car-service.png",
    detailImage: "/assets/services/hourly-car-service.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Two-hour minimum", desc: "Book as little as two hours or hold the car for a full day." },
      { title: "Stay with the same chauffeur", desc: "Consistency, familiarity and zero re-explaining." },
      { title: "Quiet, private cabin", desc: "Take calls, prep for meetings or simply decompress." },
    ],
    benefits: [
      "Flexible itineraries with mid-day changes",
      "Premium sedans and SUVs",
      "Coverage across DC, MD and VA",
      "Transparent hourly pricing",
    ],
    faqs: [
      { q: "Is there a minimum booking?", a: "Yes, two hours. After that, you can extend in 30-minute increments." },
      { q: "Can the itinerary change during the day?", a: "Absolutely. Just tell your chauffeur — flexibility is the point of hourly service." },
      { q: "Where does the chauffeur wait?", a: "Wherever it's safe and legal to stage. They'll be at the curb within minutes of your call." },
    ],
  },
  {
    slug: "long-distance",
    title: "Long Distance Car Service",
    tagline: "Door to door, state to state.",
    shortDesc: "Skip the airport. Travel between DC, Virginia, Maryland and beyond in unhurried comfort.",
    longDesc:
      "Secure, comfortable long-distance ground transport across the East Coast. Skip the airport hassle and travel door-to-door in a premium sedan or SUV — chauffeurs trained for long-haul routes, vehicles prepared for the distance.",
    image: "/assets/services/long-distance-transfers.png",
    bannerImage: "/assets/services/long-distance-transfers.png",
    detailImage: "/assets/services/long-distance-transfers.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Door-to-door comfort", desc: "No terminals, no security lines, no transfers." },
      { title: "Long-haul-trained chauffeurs", desc: "Rest-rotated for safety on extended routes." },
      { title: "Premium interior", desc: "Generous legroom, climate control, and quiet cabins." },
    ],
    benefits: [
      "Out-of-state meetings and conferences",
      "Family trips with luggage room to spare",
      "Vacation transfers without the airport stress",
      "Flat, all-inclusive pricing",
    ],
    faqs: [
      { q: "How far do you travel?", a: "Anywhere on the East Coast. NYC, Philadelphia, Richmond and Charlotte are common routes." },
      { q: "Can we make stops along the way?", a: "Yes — meals, restrooms, scenic stops. Just plan them in advance or ask en route." },
      { q: "Is the price per person or per vehicle?", a: "Per vehicle. Bring up to the seat capacity at no additional cost." },
    ],
  },
  {
    slug: "night-out",
    title: "Night Out Limo Service",
    tagline: "Stay out. Stay safe. Stay glamorous.",
    shortDesc: "Lounges, dinners, celebrations — one trusted driver for the whole evening, no parking, no worry.",
    longDesc:
      "Make the night about the night. Your chauffeur handles parking, traffic and the route between clubs, lounges and restaurants — so the only thing you have to plan is what to wear.",
    image: "/assets/services/night-out.png",
    bannerImage: "/assets/services/night-out.png",
    detailImage: "/assets/services/night-out.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Same driver all evening", desc: "One number, one chauffeur, one car ready when you are." },
      { title: "Safety first", desc: "Trained, screened chauffeurs and tracked trips for total peace of mind." },
      { title: "Group-friendly fleet", desc: "Sedans for couples or SUVs and Sprinters for the whole crew." },
    ],
    benefits: [
      "Birthdays and bachelor(ette) parties",
      "Restaurant-to-lounge transitions",
      "No surge pricing, no rideshare lottery",
      "DC, Maryland and Virginia coverage",
    ],
    faqs: [
      { q: "Can we make multiple stops?", a: "Of course. Plan the venues in advance or call audibles during the night." },
      { q: "What's the latest you operate?", a: "We run 24/7. Late nights and early mornings are no problem." },
      { q: "Is the driver waiting between stops?", a: "Yes — staged nearby, on call within minutes." },
    ],
  },
  {
    slug: "concert-transportation",
    title: "Concert Transportation",
    tagline: "Front-row entrance, every time.",
    shortDesc: "Skip the traffic at Capital One Arena, The Anthem and MGM — arrive and depart in style.",
    longDesc:
      "Concert nights, without the parking, traffic or rideshare scramble. We drop you at the venue door and stage nearby for an effortless exit when the lights come up.",
    image: "/assets/services/concert-transportation.png",
    bannerImage: "/assets/services/concert-transportation.png",
    detailImage: "/assets/services/concert-transportation.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "VIP drop and pickup", desc: "Coordinated curbside arrival and an organized exit after the show." },
      { title: "Post-show staging", desc: "Driver positions ahead of the encore so you skip the rush." },
      { title: "All major DC venues", desc: "Capital One Arena, The Anthem, MGM Theater, Wolf Trap and more." },
    ],
    benefits: [
      "Couples, friends or large groups",
      "Mixed-event nights (dinner + show)",
      "No parking fees or post-show traffic",
      "Premium, climate-controlled cabin",
    ],
    faqs: [
      { q: "When should I book?", a: "As early as possible for major shows — vehicles fill quickly on event nights." },
      { q: "Will the driver be there right after the show?", a: "Yes. We stage nearby and meet you at a pre-agreed pickup spot." },
      { q: "Can you handle large groups?", a: "Sprinters seat up to 14 — bigger groups are no problem with multi-vehicle dispatch." },
    ],
  },
  {
    slug: "wedding-transportation",
    title: "Wedding Transportation",
    tagline: "Effortless on the most important day.",
    shortDesc: "Immaculate vehicles and graceful chauffeurs for the couple, the party and the guests.",
    longDesc:
      "Wedding-day transportation that just works. Detailed timelines, immaculate vehicles and chauffeurs who understand the choreography — from first-look photos to the grand exit.",
    image: "/assets/services/wedding-pic.png",
    bannerImage: "/assets/services/wedding-pic.png",
    detailImage: "/assets/services/wedding-pic.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Detailed timeline planning", desc: "We map every pickup and drop-off with your planner ahead of time." },
      { title: "Immaculate presentation", desc: "Polished vehicles, polished chauffeurs — wedding-photo ready." },
      { title: "Multi-vehicle coordination", desc: "Couple, bridal party, family and guests — all on one dispatch." },
    ],
    benefits: [
      "Luxury sedans, SUVs and Sprinters",
      "Backup vehicles on standby",
      "Quiet, calm chauffeurs",
      "Coverage across DC, MD and VA",
    ],
    faqs: [
      { q: "How early should we book?", a: "6–9 months is ideal for peak season; we'll do our best with shorter notice." },
      { q: "Do you handle just the couple, or guests too?", a: "Both. Many couples book a full guest shuttle alongside the bridal vehicle." },
      { q: "Can the vehicle be decorated?", a: "Light, removable decor is welcome. We'll coordinate with your planner." },
    ],
  },
  {
    slug: "prom-limo-service",
    title: "Prom Limo Service",
    tagline: "A night they'll remember — safely.",
    shortDesc: "Elegant SUVs and professional chauffeurs that give teens a memorable night and parents real peace of mind.",
    longDesc:
      "Prom should feel unforgettable for students and reassuring for parents. Our vetted chauffeurs, tracked trips and elegant vehicles deliver both — across the entire DMV.",
    image: "/assets/services/prom-night-widget.png",
    bannerImage: "/assets/services/prom-night.png",
    detailImage: "/assets/services/prom-night.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Parent peace of mind", desc: "Live trip tracking and direct chauffeur contact throughout the night." },
      { title: "Vetted, professional chauffeurs", desc: "Background-checked drivers trained for student transport." },
      { title: "Group-ready fleet", desc: "SUVs and Sprinters for friend groups, couples or the whole crew." },
    ],
    benefits: [
      "No teen drivers on prom night",
      "Door-to-door coordination",
      "Photo-ready vehicles",
      "Pre-set itineraries with timed stops",
    ],
    faqs: [
      { q: "Can parents track the trip?", a: "Yes — share trip details for live status updates throughout the night." },
      { q: "Are there extra rules for prom bookings?", a: "Standard policies apply: no alcohol, no smoking, respectful behavior. Safety is non-negotiable." },
      { q: "Can multiple families share a vehicle?", a: "Absolutely. A Sprinter or SUV is often the most cost-effective option." },
    ],
  },
  {
    slug: "city-tours",
    title: "DC, Maryland & Virginia City Tours",
    tagline: "See the capital, the right way.",
    shortDesc: "Private, narrated tours of DC's monuments and neighborhoods — by day or under the lights.",
    longDesc:
      "Skip the tour buses. Explore Washington's monuments, museums and neighborhoods in a private vehicle with a chauffeur who knows the city. Customize your stops, pace and timing — including evening monument tours.",
    image: "/assets/services/city-tours.png",
    bannerImage: "/assets/services/city-tours.png",
    detailImage: "/assets/services/city-tours.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Custom itineraries", desc: "Build your own route or work from our most-loved tour templates." },
      { title: "Evening monument tour", desc: "DC's monuments look entirely different at night — let us show you." },
      { title: "Knowledgeable chauffeurs", desc: "Local insight on history, neighborhoods and where to eat after." },
    ],
    benefits: [
      "Private, climate-controlled vehicle",
      "Hop in and out at your own pace",
      "Great for families and out-of-town guests",
      "Half-day or full-day options",
    ],
    faqs: [
      { q: "Can we customize the stops?", a: "Yes — tell us your interests and we'll build the perfect route." },
      { q: "Is the chauffeur also a guide?", a: "Our chauffeurs share rich local context. For deep guided tours, we can pair with a licensed guide." },
      { q: "Are night tours available?", a: "Yes — evening monument tours are one of our most-loved experiences." },
    ],
  },
  {
    slug: "date-night",
    title: "Date Night Car Service",
    tagline: "Romance, without the logistics.",
    shortDesc: "Anniversaries, proposals and quiet evenings — arrive together, leave the driving to us.",
    longDesc:
      "Make the evening about the two of you. Skip the parking, the rideshare wait and the navigation — your chauffeur handles every detail so the moment stays uninterrupted.",
    image: "/assets/services/date-night-out-widget.png",
    bannerImage: "/assets/services/date-nights-out-detail.png",
    detailImage: "/assets/services/date-night-out-banner.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Total privacy", desc: "Quiet cabin, discreet chauffeur, the evening is yours." },
      { title: "Surprise-friendly planning", desc: "Proposals, anniversaries, special routes — we coordinate quietly." },
      { title: "Polished presentation", desc: "Spotless sedans and SUVs that match the occasion." },
    ],
    benefits: [
      "Restaurant, theater and lounge runs",
      "Hourly or point-to-point",
      "Across DC, Maryland and Virginia",
      "Same chauffeur for the full evening",
    ],
    faqs: [
      { q: "Can you help plan a proposal?", a: "Yes — we coordinate timing, route and even surprise touches with discretion." },
      { q: "Is hourly or point-to-point better?", a: "For dinner-plus-drinks, hourly. For one stop and back, point-to-point is simplest." },
      { q: "Can we extend during the night?", a: "Yes, depending on availability — just let your chauffeur know." },
    ],
  },
  {
    slug: "church-car-service",
    title: "Church Car Service",
    tagline: "Peaceful arrivals. Respectful service.",
    shortDesc: "Calm, dignified rides to Sunday service, weddings, baptisms and special church gatherings.",
    longDesc:
      "Safe, comfortable and respectful transportation to your place of worship — Sunday services, weekly gatherings, baptisms, weddings and special events. Quiet vehicles, considerate chauffeurs, on time every time.",
    image: "/assets/services/church-service.png",
    bannerImage: "/assets/services/church-service.png",
    detailImage: "/assets/services/church-service.png", // TODO: Replace with dedicated detail page image
    highlights: [
      { title: "Quiet, dignified ride", desc: "A peaceful cabin to prepare your mind for the service ahead." },
      { title: "Family-friendly fleet", desc: "Sedans for couples, SUVs for families and small groups." },
      { title: "Recurring weekly bookings", desc: "Set up a standing Sunday ride with the same chauffeur each week." },
    ],
    benefits: [
      "Sunday services and weekly gatherings",
      "Weddings, baptisms and special events",
      "Door-to-door, every step assisted",
      "Punctual, respectful chauffeurs",
    ],
    faqs: [
      { q: "Can we set up a standing weekly ride?", a: "Yes — many clients book a recurring Sunday service ride with the same chauffeur." },
      { q: "Do you assist elderly passengers?", a: "Always. Our chauffeurs help with the door, the curb and any mobility needs." },
      { q: "Can we book for special church events?", a: "Baptisms, weddings and gatherings are all welcome." },
    ],
  },
];

export const getServiceBySlug = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);
