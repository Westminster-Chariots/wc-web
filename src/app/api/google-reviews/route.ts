import { NextResponse } from "next/server";

export const runtime = "edge";

const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || "";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET() {
  if (!GOOGLE_PLACE_ID || !GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured", details: "Missing GOOGLE_PLACE_ID or GOOGLE_PLACES_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // Using Places API (New) with field mask
    const url = `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}?fields=reviews,rating,userRatingCount&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "reviews,rating,userRatingCount"
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: "Failed to fetch from Google API",
          status: response.status,
          details: errorText
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // New API format
    if (!data.reviews) {
      return NextResponse.json(
        { 
          error: "No reviews found",
          details: "The place may not have any reviews yet"
        },
        { status: 404 }
      );
    }

    // Transform new API format to match old format
    const reviews = data.reviews.map((review: any) => ({
      author_name: review.authorAttribution?.displayName || "Anonymous",
      rating: review.rating || 5,
      text: review.text?.text || review.originalText?.text || "",
      time: new Date(review.publishTime).getTime() / 1000,
      profile_photo_url: review.authorAttribution?.photoUri || ""
    }));

    return NextResponse.json({
      reviews: reviews,
      rating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
    });
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
