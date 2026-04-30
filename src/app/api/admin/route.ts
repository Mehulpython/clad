// ─── /api/admin ───────────────────────────────────────────
// Admin dashboard API — system-wide stats, user management,
// analytics, and operational data.
// NOTE: In production, add proper admin role authorization
// (e.g., check against an admin_users table or Clerk metadata)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ─── Admin check (basic) ──────────────────────────────────
// Replace with proper role-based access in production
const ADMIN_CLERK_IDS = new Set<string>(
  (process.env.ADMIN_CLERK_IDS || "").split(",").filter(Boolean)
);

async function isAdmin(userId: string): Promise<boolean> {
  // If no admins configured, allow all authenticated users (dev mode)
  if (ADMIN_CLERK_IDS.size === 0) return true;
  return ADMIN_CLERK_IDS.has(userId);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action") || "dashboard";

    switch (action) {
      case "dashboard":
        return await getDashboardData(supabase);
      case "users":
        return await getUsers(supabase, searchParams);
      case "user-detail":
        return await getUserDetail(supabase, searchParams.get("userId"));
      case "analytics":
        return await getAnalytics(supabase);
      case "system":
        return await getSystemHealth(supabase);
      case "activity":
        return await getActivityLog(supabase, searchParams);
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Admin API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin request failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const supabase = getSupabaseAdmin();

    switch (body.action) {
      case "update-user-plan":
        return await updateUserPlan(supabase, body);
      case "delete-user-data":
        return await adminDeleteUserData(supabase, body);
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Admin POST] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin action failed" },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ════════════════════════════════════════════════════════════

async function getDashboardData(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const [
    totalUsersRes,
    totalItemsRes,
    totalOutfitsRes,
    newUsersTodayRes,
    newUsersWeekRes,
    newUsersMonthRes,
    proUsersRes,
    studioUsersRes,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("wardrobe_items").select("id", { count: "exact", head: true }),
    supabase.from("outfits").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("plan", "pro"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("plan", "studio"),
  ]);

  // Plan distribution
  const [freeCount, proCount, studioCount] = [
    await supabase.from("users").select("id", { count: "exact", head: true }).eq("plan", "free"),
    proUsersRes,
    studioUsersRes,
  ];

  // Category breakdown across ALL users
  const { data: allCategories } = await supabase
    .from("wardrobe_items")
    .select("category");

  const categoryCounts: Record<string, number> = {};
  for (const item of (allCategories || [])) {
    const cat = (item as Record<string, unknown>).category as string;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Color breakdown across ALL users
  const { data: allColors } = await supabase
    .from("wardrobe_items")
    .select("primary_color");

  const colorCounts: Record<string, number> = {};
  for (const item of (allColors || [])) {
    const color = ((item as Record<string, unknown>).primary_color as string) || "unknown";
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  }

  // Items per user distribution
  const { data: usersWithItems } = await supabase
    .from("users")
    .select("id");

  let totalItemSum = 0;
  let usersWithData = 0;
  for (const u of (usersWithItems || [])) {
    const uid = (u as Record<string, unknown>).id as string;
    const { count } = await supabase
      .from("wardrobe_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid);
    if (count && count > 0) {
      totalItemSum += count;
      usersWithData++;
    }
  }

  return NextResponse.json({
    overview: {
      totalUsers: totalUsersRes.count || 0,
      totalItems: totalItemsRes.count || 0,
      totalOutfits: totalOutfitsRes.count || 0,
      newUsersToday: newUsersTodayRes.count || 0,
      newUsersWeek: newUsersWeekRes.count || 0,
      newUsersMonth: newUsersMonthRes.count || 0,
      payingUsers: (proUsersRes.count || 0) + (studioUsersRes.count || 0),
      avgItemsPerUser: usersWithData > 0 ? Math.round(totalItemSum / usersWithData * 10) / 10 : 0,
    },
    planDistribution: {
      free: freeCount.count || 0,
      pro: proUsersRes.count || 0,
      studio: studioUsersRes.count || 0,
    },
    topCategories: Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topColors: Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15),
    generatedAt: new Date().toISOString(),
  });
}

async function getUsers(supabase: ReturnType<typeof getSupabaseAdmin>, params: URLSearchParams) {
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(50, Math.max(5, parseInt(params.get("limit") || "20")));
  const search = params.get("search") || "";
  const planFilter = params.get("plan") || "";
  const sortBy = params.get("sortBy") || "created_at";
  const sortOrder = params.get("sortOrder") === "asc" ? true : false;

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order(sortBy, { ascending: sortOrder })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,clerk_id.ilike.%${search}%`);
  }
  if (planFilter && ["free", "pro", "studio"].includes(planFilter)) {
    query = query.eq("plan", planFilter);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with item/outfit counts for each user
  const enriched = await Promise.all(
    (data || []).map(async (u: Record<string, unknown>) => {
      const uid = u.id as string;
      const [items, outfits] = await Promise.all([
        supabase.from("wardrobe_items").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", uid),
      ]);
      return {
        ...u,
        itemCount: items.count || 0,
        outfitCount: outfits.count || 0,
      };
    })
  );

  return NextResponse.json({
    users: enriched,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil(((count || 0) / limit)),
    },
  });
}

async function getUserDetail(supabase: ReturnType<typeof getSupabaseAdmin>, clerkId: string | null) {
  if (!clerkId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const uid = (user as Record<string, unknown>).id as string;

  const [items, outfits] = await Promise.all([
    supabase.from("wardrobe_items").select("*").eq("user_id", uid).limit(100),
    supabase.from("outfits").select("*").eq("user_id", uid).limit(50),
  ]);

  return NextResponse.json({
    user,
    items: items.data || [],
    outfits: outfits.data || [],
    itemCount: items.count || 0,
    outfitCount: outfits.count || 0,
  });
}

async function getAnalytics(supabase: ReturnType<typeof getSupabaseAdmin>) {
  // User growth over last 30 days (by day)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: dailySignups } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at");

  const signupByDay: Record<string, number> = {};
  for (const u of (dailySignups || [])) {
    const day = ((u as Record<string, unknown>).created_at as string)?.split("T")[0];
    if (day) signupByDay[day] = (signupByDay[day] || 0) + 1;
  }

  // Plan conversion rates
  const { data: allUserPlans } = await supabase
    .from("users")
    .select("plan, created_at");

  const planConversion: Record<string, number> = { free: 0, pro: 0, studio: 0 };
  for (const u of (allUserPlans || [])) {
    const p = (u as Record<string, unknown>).plan as string;
    if (p) planConversion[p] = (planConversion[p] || 0) + 1;
  }

  // Average wardrobe size
  const { data: allUsers } = await supabase
    .from("users")
    .select("id");

  let totalWardrobeSize = 0;
  let userCountForAvg = 0;
  for (const u of (allUsers || []).slice(0, 100)) {
    const uid = (u as Record<string, unknown>).id as string;
    const { count } = await supabase
      .from("wardrobe_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid);
    if (count !== null) {
      totalWardrobeSize += count;
      userCountForAvg++;
    }
  }

  // Outfit generation frequency
  const { data: allOutfits } = await supabase
    .from("outfits")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const outfitsByDay: Record<string, number> = {};
  for (const o of (allOutfits || [])) {
    const day = ((o as Record<string, unknown>).created_at as string)?.split("T")[0];
    if (day) outfitsByDay[day] = (outfitsByDay[day] || 0) + 1;
  }

  return NextResponse.json({
    signupTrend: signupByDay,
    planDistribution: planConversion,
    avgWardrobeSize: userCountForAvg > 0 ? Math.round(totalWardrobeSize / userCountForAvg * 10) / 10 : 0,
    sampleSize: userCountForAvg,
    outfitGenerationTrend: outfitsByDay,
    generatedAt: new Date().toISOString(),
  });
}

async function getSystemHealth(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const startTime = Date.now();

  // DB connectivity test
  const { error: dbError, count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .limit(1);

  const dbLatency = Date.now() - startTime;

  // Table row counts (lightweight)
  const [usersCount, itemsCount, outfitsCount] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("wardrobe_items").select("id", { count: "exact", head: true }),
    supabase.from("outfits").select("id", { count: "exact", head: true }),
  ]);

  // Environment info (safe to expose)
  const envInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || "unknown",
  };

  return NextResponse.json({
    status: dbError ? "degraded" : "healthy",
    database: {
      connected: !dbError,
      latencyMs: dbLatency,
      tables: {
        users: usersCount.count || 0,
        wardrobe_items: itemsCount.count || 0,
        outfits: outfitsCount.count || 0,
      },
    },
    server: envInfo,
    timestamp: new Date().toISOString(),
  });
}

async function getActivityLog(supabase: ReturnType<typeof getSupabaseAdmin>, params: URLSearchParams) {
  const limit = Math.min(100, parseInt(params.get("limit") || "30"));

  // Get recent users (as proxy for activity since we don't have a dedicated audit log table yet)
  const { data: recentUsers } = await supabase
    .from("users")
    .select("display_name, created_at, plan, id")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data: recentItems } = await supabase
    .from("wardrobe_items")
    .select("user_id, item_type, primary_color, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data: recentOutfits } = await supabase
    .from("outfits")
    .select("user_id, name, confidence_score, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return NextResponse.json({
    activities: {
      signups: (recentUsers || []).map((u) => ({
        type: "user_signup",
        message: `${(u as Record<string, unknown>).display_name || "New user"} joined`,
        timestamp: (u as Record<string, unknown>).created_at,
      })),
      uploads: (recentItems || []).map((i) => ({
        type: "item_upload",
        message: `Item uploaded: ${(i as Record<string, unknown>).item_type} (${(i as Record<string, unknown>).primary_color})`,
        timestamp: (i as Record<string, unknown>).created_at,
      })),
      generations: (recentOutfits || []).map((o) => ({
        type: "outfit_generated",
        message: `Outfit: "${(o as Record<string, unknown>).name}" (${(((o as Record<string, unknown>).confidence_score as number) || 0) * 100}% confidence)`,
        timestamp: (o as Record<string, unknown>).created_at,
      })),
    },
    generatedAt: new Date().toISOString(),
  });
}

// ─── Admin mutation handlers ──────────────────────────────

async function updateUserPlan(supabase: ReturnType<typeof getSupabaseAdmin>, body: Record<string, unknown>) {
  const { clerkId, plan } = body;
  if (!clerkId || !["free", "pro", "studio"].includes(plan as string)) {
    return NextResponse.json({ error: "Invalid clerkId or plan" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ plan: plan as string, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId as string);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: `Plan updated to ${plan}` });
}

async function adminDeleteUserData(supabase: ReturnType<typeof getSupabaseAdmin>, body: Record<string, unknown>) {
  const { clerkId } = body;
  if (!clerkId) return NextResponse.json({ error: "clerkId required" }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId as string)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const uid = (user as Record<string, unknown>).id as string;

  await Promise.all([
    supabase.from("wardrobe_items").delete().eq("user_id", uid),
    supabase.from("outfits").delete().eq("user_id", uid),
    supabase.from("users").delete().eq("id", uid),
  ]);

  return NextResponse.json({ success: true, message: "User data deleted by admin" });
}
