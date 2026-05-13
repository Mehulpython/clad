// ─── GET /api/weather ──────────────────────────────────────
// Returns current weather for outfit suggestions.
// Uses Open-Meteo API (free, no key needed).
// Accepts optional ?zip= query param for user location.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Default to NYC — in production, get from user's profile/location
    let lat = 40.7128;
    let lon = -74.006;
    let resolvedLocation = "New York, NY";
    let locationSource: "user" | "default" = "default";

    // If a zip code is provided, geocode it first
    const zip = req.nextUrl.searchParams.get("zip");
    if (zip?.trim()) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip.trim())}&count=1&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json() as { results?: Array<{ latitude: number; longitude: number; name: string }> };
          if (geoData.results?.[0]) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            resolvedLocation = geoData.results[0].name;
            locationSource = "user";
          }
        }
      } catch (e) {
        console.error("[weather] Geocode failed, using default:", e);
      }
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`,
      { next: { revalidate: 1800 } } // cache for 30 min
    );

    if (!res.ok) throw new Error("Weather API error");

    const data = await res.json();
    const current = data.current;

    // Convert WMO weather code to condition string
    const weatherCodeToCondition: Record<number, string> = {
      0: "clear", 1: "mainly_clear", 2: "partly_cloudy", 3: "overcast",
      45: "foggy", 48: "depositing_rime_fog",
      51: "light_drizzle", 53: "moderate_drizzle", 55: "dense_drizzle",
      61: "slight_rain", 63: "moderate_rain", 65: "heavy_rain",
      71: "slight_snow", 73: "moderate_snow", 75: "heavy_snow",
      80: "slight_rain_showers", 81: "moderate_rain_showers", 82: "violent_rain_showers",
      95: "thunderstorm", 96: "thunderstorm_with_hail", 99: "thunderstorm_with_heavy_hail",
    };

    return NextResponse.json({
      tempF: Math.round(current.temperature_2m || 65),
      humidity: current.relative_humidity_2m || 50,
      windMph: Math.round((current.wind_speed_10m || 5) * 0.621371),
      condition: weatherCodeToCondition[current.weather_code] || "unknown",
      location: resolvedLocation,
      locationSource,
    });
  } catch (error) {
    // Return sensible defaults on failure
    return NextResponse.json({
      tempF: 65,
      humidity: 50,
      windMph: 8,
      condition: "clear",
      location: "New York, NY",
      locationSource: "default" as const,
    });
  }
}
