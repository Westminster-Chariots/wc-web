import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessName = searchParams.get("name");

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  if (!businessName) {
    return NextResponse.json(
      { error: "Business name is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Google API");
    }

    const data = await response.json();

    if (data.status === "OK" && data.candidates && data.candidates.length > 0) {
      return NextResponse.json({
        placeId: data.candidates[0].place_id,
        name: data.candidates[0].name,
      });
    }

    return NextResponse.json(
      { error: `No results found for "${businessName}"`, status: data.status },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error finding Place ID:", error);
    return NextResponse.json(
      { error: "Failed to find Place ID" },
      { status: 500 }
    );
  }
}
