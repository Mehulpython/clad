// ─── PATCH /api/wardrobe/:id & DELETE /api/wardrobe/:id ─────────────
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

// PATCH: Update an item (correct AI tags, favorite, laundry state, etc.)
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
    const { data: item, error } = await supabase
      .from("wardrobe_items")
      .update({
        ...(body.item_type && { item_type: body.item_type }),
        ...(body.primary_color && { primary_color: body.primary_color }),
        ...(body.subtype !== undefined && { subtype: body.subtype }),
        ...(body.pattern && { pattern: body.pattern }),
        ...(body.material !== undefined && { material: body.material }),
        ...(body.occasions && { occasions: body.occasions }),
        ...(body.seasons && { seasons: body.seasons }),
        ...(body.formality_level && { formality_level: body.formalityLevel }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.brand !== undefined && { brand: body.brand }),
        ...(body.size !== undefined && { size_text: body.size }),
        ...(body.price_usd !== undefined && { price_usd: body.price_usd }),
        ...(body.is_favorite !== undefined && { is_favorite: body.is_favorite }),
        ...(body.is_archived !== undefined && { is_archived: body.is_archived }),
        ...(body.is_in_laundry !== undefined && { is_in_laundry: body.is_in_laundry }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Remove item from wardrobe
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("wardrobe_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
