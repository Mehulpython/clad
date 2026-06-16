// ─── PATCH /api/outfits/[id] ───────────────────────────────
// Update outfit: toggle favorite, mark as worn, rate.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const supabase = await getSupabase();

    // Build update object from allowed fields
    const updates: Record<string, unknown> = {};
    if (typeof body.isFavorite === "boolean") updates.is_favorite = body.isFavorite;
    if (typeof body.wasWorn === "boolean") updates.was_worn = body.wasWorn;
    if (typeof body.userRating === "number") updates.user_rating = Math.min(5, Math.max(0, body.userRating));
    if (typeof body.wornOnDate === "string") updates.worn_on_date = body.wornOnDate;
    if (typeof body.name === "string") updates.name = body.name;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("outfits")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[outfits] Update error:", error);
      return NextResponse.json({ error: "Failed to update outfit" }, { status: 500 });
    }

    return NextResponse.json({ success: true, outfit: data });
  } catch (error) {
    console.error("Outfit update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/outfits/[id] ──────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = await getSupabase();

    const { error } = await supabase
      .from("outfits")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete outfit" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Outfit delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
