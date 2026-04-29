// ─── GET/POST /api/planner ─────────────────────────────────
// Weekly outfit planner.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { generateOutfitCandidates, refineOutfitsWithAI } from "@/lib/outfit-engine";
import type { DayPlan, WeekPlan, OutfitContext, Occasion, Mood, WardrobeItem } from "@/lib/types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_DAY_CONTEXTS: Array<{ occasion: Occasion; mood: Mood }> = [
  { occasion: "work",     mood: "professional" },
  { occasion: "work",     mood: "comfortable" },
  { occasion: "work",     mood: "minimal" },
  { occasion: "work",     mood: "classic" },
  { occasion: "casual",   mood: "playful" },
  { occasion: "casual",   mood: "trendy" },
  { occasion: "brunch",   mood: "romantic" },
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    const { data: plans, error } = await supabase
      .from("week_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !plans || plans.length === 0) {
      return NextResponseJson({ plans: [], message: "No week plans found. Generate one!" });
    }

    const latest = plans[0] as Record<string, unknown>;
    return NextResponseJson({
      plan: {
        weekOf: latest.week_of as string,
        days: (latest.days as DayPlan[]) || [],
        generatedAt: latest.created_at as string,
      },
    });
  } catch (error) {
    console.error("Planner GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    // Fetch wardrobe
    const { data: rawItems, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .eq("is_in_laundry", false);

    if (itemsError || !rawItems) {
      return NextResponse.json({ error: "Failed to load wardrobe" }, { status: 500 });
    }

    const wardrobe: WardrobeItem[] = (rawItems as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      itemType: (row.item_type as string) as WardrobeItem["itemType"],
      category: (row.category as string) as WardrobeItem["category"],
      subtype: (row.subtype as string) || "",
      primaryColor: (row.primary_color as string) || "unknown",
      secondaryColor: row.secondary_color as string | null,
      pattern: ((row.pattern as string) || "solid") as any,
      material: (row.material as any) as any || null,
      occasions: [],
      seasons: [],
      formalityLevel: Number(row.formality_level) || 3,
      tags: [],
      aiConfidence: Number(row.ai_confidence) || 0.5,
      brand: null,
      size: null,
      purchasedFrom: null,
      priceUsd: null,
      purchaseDate: null,
      imageUrl: (row.image_url as string) || "",
      thumbnailUrl: (row.thumbnail_url as string) || "",
      aiRawOutput: null,
      isFavorite: Boolean(row.is_favorite),
      isArchived: Boolean(row.is_archived),
      isInLaundry: Boolean(row.is_in_laundry),
      wearCount: Number(row.wear_count) || 0,
      lastWornAt: null,
      correctedFields: [],
      suggestedName: (row.primary_color as string) + " " + (row.item_type as string),
      createdAt: (row.created_at as string) || "",
      updatedAt: (row.updated_at as string) || "",
    }));

    // Get weather for the week (use current as proxy)
    let weatherContext;
    try {
      const weatherRes = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
      );
      if (weatherRes.ok) {
        const wdata = await weatherRes.json() as Record<string, unknown>;
        const current = wdata.current as Record<string, unknown>;
        weatherContext = {
          tempF: Math.round(((current.temperature_2m as number) * 9) / 5 + 32),
          condition: weatherCodeToCondition(Number(current.weather_code)),
          humidity: Number(current.relative_humidity_2m) || 50,
          windMph: Math.round((Number(current.wind_speed_10m) || 0) * 0.621371),
        };
      }
    } catch (e) {
      // Weather is optional
    }

    // Generate outfits for each day
    const days: DayPlan[] = [];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Previous Monday

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const ctx = DEFAULT_DAY_CONTEXTS[i];
      const context: OutfitContext = {
        occasion: ctx.occasion,
        mood: ctx.mood,
        timeAvailable: "normal",
        locationType: "mixed",
        weather: weatherContext,
      };

      const candidates = generateOutfitCandidates(wardrobe, context);
      const refined = await refineOutfitsWithAI(candidates.slice(0, 5), context);

      days.push({
        date: dayDate.toISOString().split("T")[0],
        dayName: DAY_NAMES[i],
        morningOutfit: refined[0] ? {
          id: "",
          userId,
          name: refined[0].name,
          itemIds: refined[0].itemIds,
          context,
          aiReasoning: refined[0].reasoning,
          confidenceScore: refined[0].confidence,
          plannedFor: dayDate.toISOString().split("T")[0],
          wasWorn: false,
          wornOnDate: null,
          userRating: null,
          isFavorite: false,
          createdAt: new Date().toISOString(),
        } : null,
        eveningOutfit: refined[1] ? {
          id: "",
          userId,
          name: refined[1].name,
          itemIds: refined[1].itemIds,
          context: { ...context, occasion: "casual" as Occasion, mood: "comfortable" as Mood },
          aiReasoning: refined[1].reasoning,
          confidenceScore: refined[1].confidence,
          plannedFor: dayDate.toISOString().split("T")[0],
          wasWorn: false,
          wornOnDate: null,
          userRating: null,
          isFavorite: false,
          createdAt: new Date().toISOString(),
        } : null,
        eventOutfits: [],
        notes: ctx.occasion === "work"
          ? "Work day — layer options available"
          : ctx.occasion === "brunch" ? "Sunday brunch — keep it relaxed but stylish" : null,
      });
    }

    const weekPlan: WeekPlan = {
      weekOf: monday.toISOString().split("T")[0],
      days,
      generatedAt: new Date().toISOString(),
    };

    // Save to DB
    try {
      await supabase.from("week_plans").insert({
        user_id: userId,
        week_of: weekPlan.weekOf,
        days: weekPlan.days as unknown as Record<string, unknown>[],
      });
    } catch (e) {
      console.error("[planner] Failed to save plan:", e);
    }

    return NextResponse.json({
      plan: weekPlan,
      message: "Week plan generated successfully!",
    });
  } catch (error) {
    console.error("Planner POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Plan generation failed" },
      { status: 500 }
    );
  }
}

function NextResponseJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 59) return "Rainy";
  if (code <= 69) return "Snowy";
  if (code <= 79) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
