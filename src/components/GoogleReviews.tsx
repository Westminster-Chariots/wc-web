"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Google Reviews API Error:", data);
          setError(true);
        } else if (data.reviews) {
          // Show all 4-5 star reviews, no limit
          setReviews(data.reviews.filter((r: GoogleReview) => r.rating >= 4));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] animate-pulse rounded-3xl border border-white/10 bg-background/60 p-8">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="mt-5 space-y-2">
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                </div>
                <div className="mt-6 h-3 w-32 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    const fallbackReviews = [
      {
        quote: "Outstanding experience. The car was spotless and luxurious, and the driver was extremely professional, polite and punctual. It truly felt like a first-class travel experience. I'll definitely be booking again!",
        name: "Howard Chavez",
        role: "Entrepreneur",
        rating: 5
      },
      {
        quote: "From the moment I was picked up I felt taken care of. Immaculate vehicle, calm and considerate chauffeur — exactly the standard you hope for and rarely get.",
        name: "Lucas Elliot",
        role: "Designer",
        rating: 5
      }
    ];

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {fallbackReviews.map((review, idx) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)]">
                <Testimonial
                  quote={review.quote}
                  name={review.name}
                  role={review.role}
                  rating={review.rating}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)]">
              <Testimonial
                quote={review.text}
                name={review.author_name}
                role="Google Review"
                rating={review.rating}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {reviews.length > 2 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 h-12 w-12 rounded-full border border-white/20 bg-background/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 h-12 w-12 rounded-full border border-white/20 bg-background/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {reviews.length > 2 && (
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, idx) => {
            const isVisible = emblaApi?.selectedScrollSnap() === idx;
            return (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`h-2 rounded-full transition-all ${
                  isVisible ? "w-8 bg-accent-blue-bright" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Testimonial({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
  return (
    <figure className="rounded-3xl border border-white/10 bg-background/60 p-8 backdrop-blur-md">
      <div className="flex gap-1 text-accent-blue-bright">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-current" : ""}`} />
        ))}
      </div>
      <blockquote className="mt-5 font-serif text-xl font-light leading-relaxed text-foreground/90 line-clamp-4">
        "{quote}"
      </blockquote>
      <figcaption className="mt-6 text-sm">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="text-foreground/55"> · {role}</span>
      </figcaption>
    </figure>
  );
}
