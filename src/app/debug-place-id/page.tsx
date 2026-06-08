"use client";

import { useState } from "react";

export default function PlaceIdHelper() {
  const [businessName, setBusinessName] = useState("Westminster Chariots");
  const [placeId, setPlaceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBusiness = async () => {
    setLoading(true);
    setError("");
    setPlaceId("");

    try {
      const response = await fetch(
        `/api/find-place-id?name=${encodeURIComponent(businessName)}`
      );
      const data = await response.json();

      if (data.placeId) {
        setPlaceId(data.placeId);
      } else {
        setError(data.error || "Place ID not found");
      }
    } catch (err) {
      setError("Failed to fetch Place ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Find Your Google Place ID</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              placeholder="Westminster Chariots"
            />
          </div>

          <button
            onClick={searchBusiness}
            disabled={loading}
            className="w-full bg-accent-blue-bright text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Place ID"}
          </button>

          {placeId && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h2 className="font-semibold text-green-400 mb-2">Place ID Found!</h2>
              <code className="block p-3 bg-black/40 rounded text-sm break-all">
                {placeId}
              </code>
              <p className="mt-3 text-sm text-foreground/70">
                Add this to your .env file as GOOGLE_PLACE_ID
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-card/40 rounded-lg">
            <h3 className="font-semibold mb-2">Alternative Method:</h3>
            <ol className="text-sm space-y-2 text-foreground/70">
              <li>1. Go to Google Maps</li>
              <li>2. Search for "Westminster Chariots"</li>
              <li>3. Click on your business</li>
              <li>4. Check the URL - it should contain the Place ID</li>
              <li>5. Or use: <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" className="text-accent-blue-bright underline" target="_blank" rel="noopener">Google Place ID Finder</a></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
