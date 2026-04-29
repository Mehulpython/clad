// ─── GET/PUT /api/profile ──────────────────────────────────
// User profile & style preferences.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import type { UserProfile, StylePreferences, Gender, BodyType, SkinTone } from "@/lib/types";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (error || !user) {
      // Return default profile — user might not exist yet
      return NextResponse.json({
        profile: createDefaultProfile(userId),
        isNew: true,
      });
    }

    const row = user as Record<string, unknown>;
    const profile: UserProfile = {
      id: row.id as string,
      clerkId: row.clerk_id as string,
      displayName: row.display_name as string | null,
      gender: (row.gender as Gender) || null,
      bodyType: (row.body_type as BodyType) || null,
      skinTone: (row.skin_tone as SkinTone) || null,
      heightCm: row.height_cm as number | null,
      budgetMonthly: row.budget_monthly as number | null,
      locationZip: row.location_zip as string | null,
      stylePreferences: (row.style_preferences as StylePreferences) || defaultStylePrefs(),
      itemCount: 0,
      outfitCount: 0,
      createdAt: (row.created_at as string) || "",
    };

    // Get counts
    const [itemCountRes, outfitCountRes] = await Promise.all([
      supabase.from("wardrobe_items").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
      supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    ]);

    profile.itemCount = itemCountRes.count || 0;
    profile.outfitCount = outfitCountRes.count || 0;

    return NextResponse.json({ profile, isNew: false });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const supabase = await getSupabase();

    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    const stylePrefs: StylePreferences = {
      favoriteColors: body.favoriteColors || [],
      avoidedColors: body.avoidedColors || [],
      preferredStyle: body.preferredStyle || "casual",
      riskTolerance: body.riskTolerance || "moderate",
      brandAffinity: body.brandAffinity || null,
      dressCodeNotes: body.dressCodeNotes || null,
    };

    const updateData: Record<string, unknown> = {
      display_name: body.displayName || null,
      gender: body.gender || null,
      body_type: body.bodyType || null,
      skin_tone: body.skinTone || null,
      height_cm: body.heightCm || null,
      budget_monthly: body.budgetMonthly || null,
      location_zip: body.locationZip || null,
      style_preferences: stylePrefs as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("clerk_id", userId);

      if (error) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("users").insert({
        clerk_id: userId,
        ...updateData,
      });

      if (error) {
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Profile saved!" });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save profile" },
      { status: 500 }
    );
  }
}

function createDefaultProfile(clerkId: string): UserProfile {
  return {
    id: "",
    clerkId,
    displayName: null,
    gender: null,
    bodyType: null,
    skinTone: null,
    heightCm: null,
    budgetMonthly: null,
    locationZip: null,
    stylePreferences: defaultStylePrefs(),
    itemCount: 0,
    outfitCount: 0,
    createdAt: new Date().toISOString(),
  };
}

function defaultStylePrefs(): StylePreferences {
  return {
    favoriteColors: ["navy", "white", "black"],
    avoidedColors: [],
    preferredStyle: "casual",
    riskTolerance: "moderate",
    brandAffinity: null,
    dressCodeNotes: null,
  };
}
