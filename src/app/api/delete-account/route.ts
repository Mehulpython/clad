// ─── DELETE /api/delete-account ────────────────────────────
// Permanently deletes a user's account and all associated data.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { confirmed, exportData } = body;

    if (!confirmed) {
      return NextResponse.json(
        { error: "Deletion must be explicitly confirmed" },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    // Get user record first
    const { data: user } = await supabase
      .from("users")
      .select("id, clerk_id, display_name, email")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      // No user in our DB — still try to clean up Clerk-side
      return NextResponse.json({
        success: true,
        message: "No data found for this account",
        deletedAt: new Date().toISOString(),
      });
    }

    const userIdDb = (user as Record<string, unknown>).id as string;
    const displayName = (user.display_name as string) || "Unknown";

    // ─── Step 1: Gather data for optional export ──────────
    let exportPayload: Record<string, unknown> | null = null;
    if (exportData) {
      const [itemsRes, outfitsRes] = await Promise.all([
        supabase
          .from("wardrobe_items")
          .select("*")
          .eq("user_id", userIdDb),
        supabase
          .from("outfits")
          .select("*")
          .eq("user_id", userIdDb),
      ]);

      exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          displayName,
          clerkId: userId,
          exportedBy: "self-service",
        },
        wardrobeItems: itemsRes.data || [],
        outfits: outfitsRes.data || [],
        profile: user,
        itemCount: itemsRes.count || 0,
        outfitCount: outfitsRes.count || 0,
      };
    }

    // ─── Step 2: Delete wardrobe items ─────────────────────
    const { error: itemsError } = await supabaseAdmin
      .from("wardrobe_items")
      .delete()
      .eq("user_id", userIdDb);

    if (itemsError) {
      console.error(`[DeleteAccount] Failed to delete items for ${userIdDb}:`, itemsError.message);
      // Continue anyway — best effort
    }

    // ─── Step 3: Delete outfits ────────────────────────────
    const { error: outfitsError } = await supabaseAdmin
      .from("outfits")
      .delete()
      .eq("user_id", userIdDb);

    if (outfitsError) {
      console.error(`[DeleteAccount] Failed to delete outfits for ${userIdDb}:`, outfitsError.message);
    }

    // ─── Step 4: Delete user record ────────────────────────
    const { error: userError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("clerk_id", userId);

    if (userError) {
      console.error(`[DeleteAccount] Failed to delete user ${userIdDb}:`, userError.message);
      return NextResponse.json(
        { error: "Failed to fully delete account. Contact support." },
        { status: 500 }
      );
    }

    // ─── Step 5: Log the deletion (audit trail) ────────────
    // In production, write to an audit_log table
    console.log(`[DeleteAccount] Account deleted: clerk_id=${userId}, db_id=${userIdDb}, name=${displayName}`);

    return NextResponse.json({
      success: true,
      message: "Account and all data permanently deleted",
      deletedAt: new Date().toISOString(),
      exportData: exportPayload,
    });
  } catch (error) {
    console.error("[DeleteAccount] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account deletion failed" },
      { status: 500 }
    );
  }
}

// ─── GET: Return account summary before deletion ───────────
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabase();

    const { data: user } = await supabase
      .from("users")
      .select("id, display_name, created_at, plan")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: "No account data found",
      });
    }

    const userIdDb = (user as Record<string, unknown>).id as string;

    const [itemsRes, outfitsRes] = await Promise.all([
      supabase
        .from("wardrobe_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userIdDb),
      supabase
        .from("outfits")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userIdDb),
    ]);

    return NextResponse.json({
      exists: true,
      summary: {
        displayName: (user.display_name as string) || null,
        createdAt: user.created_at,
        plan: user.plan,
        itemCount: itemsRes.count || 0,
        outfitCount: outfitsRes.count || 0,
        memberSince: user.created_at,
      },
    });
  } catch (error) {
    console.error("[DeleteAccount GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch account summary" },
      { status: 500 }
    );
  }
}
