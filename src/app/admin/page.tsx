"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────

interface DashboardOverview {
  totalUsers: number;
  totalItems: number;
  totalOutfits: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  payingUsers: number;
  avgItemsPerUser: number;
}

interface PlanDistribution {
  free: number;
  pro: number;
  studio: number;
}

interface AdminUser {
  id: string;
  clerk_id: string;
  display_name: string | null;
  plan: string;
  created_at: string;
  updated_at: string | null;
  itemCount: number;
  outfitCount: number;
  gender?: string | null;
  body_type?: string | null;
  location_zip?: string | null;
}

interface ActivityFeed {
  signups: Array<{ type: string; message: string; timestamp: string }>;
  uploads: Array<{ type: string; message: string; timestamp: string }>;
  generations: Array<{ type: string; message: string; timestamp: string }>;
}

interface SystemHealth {
  status: string;
  database: {
    connected: boolean;
    latencyMs: number;
    tables: { users: number; wardrobe_items: number; outfits: number };
  };
  server: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryUsage: NodeJS.MemoryUsage;
    environment: string;
  };
  timestamp: string;
}

type TabType =
  | "dashboard"
  | "users"
  | "analytics"
  | "system"
  | "activity";

export default function AdminDashboard() {
  const router = useRouter();

  // ─── State ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [planDist, setPlanDist] = useState<PlanDistribution | null>(null);
  const [topCategories, setTopCategories] = useState<[string, number][]>([]);
  const [topColors, setTopColors] = useState<[string, number][]>([]);

  // Users data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("");
  const [userSortBy, setUserSortBy] = useState("created_at");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Analytics data
  const [signupTrend, setSignupTrend] = useState<Record<string, number>>({});
  const [outfitTrend, setOutfitTrend] = useState<Record<string, number>>({});
  const [avgWardrobeSize, setAvgWardrobeSize] = useState(0);

  // System health
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Activity
  const [activity, setActivity] = useState<ActivityFeed | null>(null);

  // Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalTarget, setPlanModalTarget] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState("");

  // ─── Data Fetchers ──────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin?action=dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      const data = await res.json();
      setOverview(data.overview);
      setPlanDist(data.planDistribution);
      setTopCategories(data.topCategories || []);
      setTopColors(data.topColors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        action: "users",
        page: userPage.toString(),
        limit: "15",
        search: userSearch,
        plan: userPlanFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users || []);
      setUserTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error("Fetch users error:", e);
    }
  }, [userPage, userSearch, userPlanFilter, userSortBy, userSortOrder]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?action=analytics");
      if (!res.ok) return;
      const data = await res.json();
      setSignupTrend(data.signupTrend || {});
      setOutfitTrend(data.outfitGenerationTrend || {});
      setAvgWardrobeSize(data.avgWardrobeSize || 0);
    } catch (e) {
      console.error("Fetch analytics error:", e);
    }
  }, []);

  const fetchSystem = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?action=system");
      if (!res.ok) return;
      const data = await res.json();
      setSystemHealth(data);
    } catch (e) {
      console.error("Fetch system error:", e);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?action=activity&limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setActivity(data.activities);
    } catch (e) {
      console.error("Fetch activity error:", e);
    }
  }, []);

  // ─── Initial Load ──────────────────────────────────────
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "system") fetchSystem();
    if (activeTab === "activity") fetchActivity();
  }, [activeTab, fetchUsers, fetchAnalytics, fetchSystem, fetchActivity]);

  // ─── Admin Actions ──────────────────────────────────────

  async function handleUpdatePlan() {
    if (!planModalTarget || !newPlan) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-user-plan",
          clerkId: planModalTarget.clerk_id,
          plan: newPlan,
        }),
      });
      const data = await res.json();
      setActionResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
      setShowPlanModal(false);
      setNewPlan("");
      fetchUsers();
      fetchDashboard();
    } catch (e) {
      setActionResult(`❌ ${(e as Error).message}`);
    }
    setActionLoading(false);
  }

  async function handleDeleteUserData(user: AdminUser) {
    if (!confirm(`Permanently delete all data for ${user.display_name || user.clerk_id}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-user-data",
          clerkId: user.clerk_id,
        }),
      });
      const data = await res.json();
      setActionResult(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
      fetchUsers();
      fetchDashboard();
    } catch (e) {
      setActionResult(`❌ ${(e as Error).message}`);
    }
    setActionLoading(false);
  }

  // ─── Helpers ───────────────────────────────────────────

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "analytics", label: "Analytics", icon: "📈" },
    { key: "system", label: "System", icon: "🖥️" },
    { key: "activity", label: "Activity", icon: "📋" },
  ];

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 sticky top-16 md:top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/wardrobe")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to App
            </button>
            <span className="text-gray-600">|</span>
            <h1 className="text-lg font-bold">
              🔐 <span className="text-red-400">Admin</span> Dashboard
            </h1>
          </div>

          {/* Action Result Toast */}
          {actionResult && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
              {actionResult}
            </div>
          )}

          <button
            onClick={() => {
              fetchDashboard();
              setActionResult("🔄 Refreshed");
              setTimeout(() => setActionResult(null), 2000);
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all " +
                (activeTab === tab.key
                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                  : "text-gray-400 bg-white/5 hover:bg-white/10")
              }
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════════ DASHBOARD TAB ═════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {loading && !overview ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="glass-card p-8 text-center text-red-400">{error}</div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { label: "Total Users", value: overview?.totalUsers || 0, icon: "👤", color: "text-[#e879f9]" },
                    { label: "Total Items", value: overview?.totalItems || 0, icon: "👔", color: "text-blue-400" },
                    { label: "Total Outfits", value: overview?.totalOutfits || 0, icon: "✨", color: "text-green-400" },
                    { label: "Paying Users", value: overview?.payingUsers || 0, icon: "💎", color: "text-yellow-400" },
                    { label: "New Today", value: overview?.newUsersToday || 0, icon: "📅", color: "text-orange-400" },
                    { label: "This Week", value: overview?.newUsersWeek || 0, icon: "📆", color: "text-cyan-400" },
                    { label: "This Month", value: overview?.newUsersMonth || 0, icon: "🗓️", color: "text-purple-400" },
                    { label: "Avg Items/User", value: overview?.avgItemsPerUser || 0, icon: "📊", color: "text-pink-400" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="glass-card p-3 text-center group hover:border-red-500/20 transition-all">
                      <p className="text-base mb-0.5">{kpi.icon}</p>
                      <p className={"text-lg font-bold " + kpi.color}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Plan Distribution */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">💎 Plan Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Free", count: planDist?.free || 0, color: "bg-gray-500", pct: planDist ? Math.round((planDist.free / ((planDist.free + planDist.pro + planDist.studio) || 1)) * 100) : 0 },
                        { label: "Pro ($6.99/mo)", count: planDist?.pro || 0, color: "bg-[#e879f9]", pct: planDist ? Math.round((planDist.pro / ((planDist.free + planDist.pro + planDist.studio) || 1)) * 100) : 0 },
                        { label: "Studio ($14.99/mo)", count: planDist?.studio || 0, color: "bg-purple-500", pct: planDist ? Math.round((planDist.studio / ((planDist.free + planDist.pro + planDist.studio) || 1)) * 100) : 0 },
                      ].map((plan) => (
                        <div key={plan.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{plan.label}</span>
                            <span className="text-gray-400">{plan.count} ({plan.pct}%)</span>
                          </div>
                          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${plan.color} rounded-full transition-all duration-700`}
                              style={{ width: plan.pct + "%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between text-xs text-gray-500">
                      <span>Conversion Rate:</span>
                      <span className="text-yellow-400">
                        {planDist && (planDist.free + planDist.pro + planDist.studio) > 0
                          ? (((planDist.pro + planDist.studio) / (planDist.free + planDist.pro + planDist.studio)) * 100).toFixed(1)
                          : 0}% to paid
                      </span>
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">📦 Top Categories (All Users)</h3>
                    <div className="space-y-2">
                      {topCategories.slice(0, 8).map(([cat, count]) => {
                        const maxCount = topCategories[0]?.[1] || 1;
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <span className="text-xs w-24 capitalize truncate text-gray-300">{cat}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#e879f9] to-blue-500 rounded-full"
                                style={{ width: Math.round((count / maxCount) * 100) + "%" }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Colors */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">🎨 Top Wardrobe Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {topColors.slice(0, 12).map(([color, count]) => (
                        <div
                          key={color}
                          className="flex items-center gap-2 bg-white/5 rounded-full pl-1 pr-3 py-1"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{
                              backgroundColor:
                                color === "black"
                                  ? "#000"
                                  : color === "white"
                                  ? "#fff"
                                  : color === "navy"
                                  ? "#1e293b"
                                  : color === "gray"
                                  ? "#6b7280"
                                  : color === "blue"
                                  ? "#3b82f6"
                                  : color === "red"
                                  ? "#ef4444"
                                  : color === "green"
                                  ? "#22c55e"
                                  : color === "yellow"
                                  ? "#eab308"
                                  : color === "brown"
                                  ? "#92400e"
                                  : color === "beige"
                                  ? "#d4b996"
                                  : color === "black" ? "#000000" : "#" + Math.floor(Math.random()*16777215).toString(16),
                            }}
                          />
                          <span className="text-xs text-gray-300 capitalize">{color}</span>
                          <span className="text-[10px] text-gray-500">({count})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">⚡ Quick Insights</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg">
                        <span className="text-lg">📈</span>
                        <div>
                          <p className="text-sm font-medium">Growth Rate</p>
                          <p className="text-xs text-gray-400">
                            {overview && overview.newUsersWeek > 0
                              ? `+${overview.newUsersWeek} users this week`
                              : "No new users this week yet"}
                            {overview && overview.newUsersMonth > 0 &&
                              `, ${overview.newUsersMonth} this month`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg">
                        <span className="text-lg">👔</span>
                        <div>
                          <p className="text-sm font-medium">Engagement Depth</p>
                          <p className="text-xs text-gray-400">
                            Avg {overview?.avgItemsPerUser || 0} items per active user
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg">
                        <span className="text-lg">💰</span>
                        <div>
                          <p className="text-sm font-medium">Revenue Potential</p>
                          <p className="text-xs text-gray-400">
                            {(planDist?.pro || 0)} Pro × $6.99 +{" "}
                            {(planDist?.studio || 0)} Studio × $14.99 ={" "}
                            <span className="text-green-400 font-medium">
                              ${(((planDist?.pro || 0) * 6.99 + (planDist?.studio || 0) * 14.99)).toFixed(0)}/mo
                            </span>{" "}
                            MRR potential
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═════════════ USERS TAB ═════════════ */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by name or Clerk ID..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <select
                value={userPlanFilter}
                onChange={(e) => {
                  setUserPlanFilter(e.target.value);
                  setUserPage(1);
                }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="studio">Studio</option>
              </select>
              <select
                value={userSortBy}
                onChange={(e) => {
                  setUserSortBy(e.target.value);
                  setUserPage(1);
                }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="created_at">Created Date</option>
                <option value="display_name">Name</option>
                <option value="plan">Plan</option>
                <option value="updated_at">Last Active</option>
              </select>
              <button
                onClick={() => setUserSortOrder(userSortOrder === "desc" ? "asc" : "desc")}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10"
              >
                {userSortOrder === "desc" ? "↓ New" : "↑ Old"}
              </button>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-xs text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left p-3 text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Plan</th>
                    <th className="text-right p-3 text-xs text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="text-right p-3 text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">Outfits</th>
                    <th className="text-left p-3 text-xs text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-right p-3 text-xs text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                            {(u.display_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[120px] sm:max-w-[180px]">
                              {u.display_name || "Unnamed"}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono truncate max-w-[120px] sm:max-w-[180px]">
                              {u.clerk_id.slice(0, 12)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span
                          className={
                            "text-xs px-2 py-0.5 rounded-full font-medium " +
                            (u.plan === "free"
                              ? "bg-gray-500/15 text-gray-300"
                              : u.plan === "pro"
                              ? "bg-[#e879f9]/15 text-[#e879f9]"
                              : "bg-purple-500/15 text-purple-300")
                          }
                        >
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-xs">{u.itemCount}</td>
                      <td className="p-3 text-right font-mono text-xs hidden md:table-cell">{u.outfitCount}</td>
                      <td className="p-3 text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlanModalTarget(u);
                              setNewPlan(u.plan);
                              setShowPlanModal(true);
                            }}
                            className="p-1.5 rounded bg-white/5 hover:bg-[#e879f9]/15 text-gray-400 hover:text-[#e879f9] transition-colors"
                            title="Change Plan"
                          >
                            💎
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUserData(u);
                            }}
                            className="p-1.5 rounded bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Data"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No users found
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {userPage} of {userTotalPages}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={userPage <= 1}
                  onClick={() => setUserPage(userPage - 1)}
                  className="px-3 py-1.5 rounded bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  ← Prev
                </button>
                <button
                  disabled={userPage >= userTotalPages}
                  onClick={() => setUserPage(userPage + 1)}
                  className="px-3 py-1.5 rounded bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Selected User Detail Panel */}
            {selectedUser && (
              <div className="glass-card p-5 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    👤 {selectedUser.display_name || "Unnamed User"}
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-[#e879f9]">{selectedUser.itemCount}</p>
                    <p className="text-[10px] text-gray-500">Items</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-400">{selectedUser.outfitCount}</p>
                    <p className="text-[10px] text-gray-500">Outfits</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold capitalize">{selectedUser.plan}</p>
                    <p className="text-[10px] text-gray-500">Plan</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-400">
                      {selectedUser.gender || "—"}
                    </p>
                    <p className="text-[10px] text-gray-500">Gender</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 space-y-0.5 font-mono">
                  <p>ID: {selectedUser.id}</p>
                  <p>Clerk ID: {selectedUser.clerk_id}</p>
                  <p>Location: {selectedUser.location_zip || "Not set"}</p>
                  <p>Body Type: {selectedUser.body_type || "Not set"}</p>
                  <p>Joined: {new Date(selectedUser.created_at).toLocaleString()}</p>
                  <p>Updated: {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : "Never"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════ ANALYTICS TAB ═════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signup Trend */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-sm">📈 Signups (Last 30 Days)</h3>
                {Object.keys(signupTrend).length > 0 ? (
                  <div className="flex items-end gap-1 h-40">
                    {Object.entries(signupTrend)
                      .sort()
                      .slice(-25)
                      .map(([date, count]) => {
                        const maxVal = Math.max(...Object.values(signupTrend), 1);
                        const height = Math.max(8, (count / maxVal) * 100);
                        return (
                          <div
                            key={date}
                            className="flex-1 flex flex-col items-center gap-1 group"
                          >
                            <div className="relative w-full flex items-end justify-center" style={{ height: "140px" }}>
                              <div
                                className="w-full max-w-[24px] bg-gradient-to-t from-red-500/60 to-[#e879f9]/80 rounded-t-sm min-h-[2px] group-hover:from-red-500 group-hover:to-[#e879f9] transition-all cursor-pointer"
                                style={{ height: height + "%" }}
                                title={`${date}: ${count} signups`}
                              />
                            </div>
                            <span className="text-[8px] text-gray-600 rotate-[-45deg] origin-top-left whitespace-nowrap">
                              {date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-10">No signup data yet</p>
                )}
              </div>

              {/* Outfit Generation Trend */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-sm">✨ Outfit Generations (Recent)</h3>
                {Object.keys(outfitTrend).length > 0 ? (
                  <div className="flex items-end gap-1 h-40">
                    {Object.entries(outfitTrend)
                      .sort()
                      .slice(-20)
                      .map(([date, count]) => {
                        const maxVal = Math.max(...Object.values(outfitTrend), 1);
                        const height = Math.max(8, (count / maxVal) * 100);
                        return (
                          <div
                            key={date}
                            className="flex-1 flex flex-col items-center gap-1 group"
                          >
                            <div className="relative w-full flex items-end justify-center" style={{ height: "140px" }}>
                              <div
                                className="w-full max-w-[24px] bg-gradient-to-t from-green-500/60 to-emerald-400/80 rounded-t-sm min-h-[2px] group-hover:from-green-500 group-hover:to-emerald-400 transition-all cursor-pointer"
                                style={{ height: height + "%" }}
                                title={`${date}: ${count} outfits`}
                              />
                            </div>
                            <span className="text-[8px] text-gray-600 rotate-[-45deg] origin-top-left whitespace-nowrap">
                              {date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-10">No outfit generation data yet</p>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Avg Wardrobe Size", value: avgWardrobeSize.toString(), sub: "items per user", icon: "👔" },
                { label: "Data Sample Size", value: "100", sub: "users analyzed", icon: "📊" },
                { label: "Data Points", value: Object.keys(signupTrend).length.toString(), sub: "days of signups", icon: "📅" },
                { label: "Gen Events", value: Object.keys(outfitTrend).length.toString(), sub: "days tracked", icon: "✨" },
              ].map((m) => (
                <div key={m.label} className="glass-card p-4 text-center">
                  <p className="text-base mb-1">{m.icon}</p>
                  <p className="text-xl font-bold text-white">{m.value}</p>
                  <p className="text-[10px] text-gray-500">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════ SYSTEM TAB ═════════════ */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {!systemHealth ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Status Banner */}
                <div
                  className={
                    "rounded-xl p-4 flex items-center gap-3 " +
                    (systemHealth.status === "healthy"
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-yellow-500/10 border border-yellow-500/20")
                  }
                >
                  <div
                    className={
                      "w-3 h-3 rounded-full " +
                      (systemHealth.status === "healthy" ? "bg-green-400 animate-pulse" : "bg-yellow-400")
                    }
                  />
                  <span
                    className={
                      "font-semibold text-sm " +
                      (systemHealth.status === "healthy" ? "text-green-300" : "text-yellow-300")
                    }
                  >
                    System Status: {systemHealth.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    Checked at {new Date(systemHealth.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Database Health */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">🗄️ Database Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Connection</span>
                        <span className={systemHealth.database.connected ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                          {systemHealth.database.connected ? "● Connected" : "● Disconnected"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Latency</span>
                        <span className={`text-sm font-mono ${systemHealth.database.latencyMs < 200 ? "text-green-400" : systemHealth.database.latencyMs < 500 ? "text-yellow-400" : "text-red-400"}`}>
                          {systemHealth.database.latencyMs}ms
                        </span>
                      </div>
                      <div className="border-t border-white/5 pt-3 mt-3">
                        <p className="text-xs text-gray-500 mb-2">Table Row Counts</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(systemHealth.database.tables).map(([name, count]) => (
                            <div key={name} className="bg-white/5 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{count.toLocaleString()}</p>
                              <p className="text-[9px] text-gray-500 capitalize">{name.replace("_", " ")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Server Info */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-sm">🖥️ Server Information</h3>
                    <div className="space-y-2">
                      {[
                        ["Node.js Version", systemHealth.server.nodeVersion],
                        ["Platform", systemHealth.server.platform],
                        ["Environment", systemHealth.server.environment],
                        ["Uptime", formatUptime(systemHealth.server.uptimeSeconds)],
                        ["RSS Memory", formatBytes(systemHealth.server.memoryUsage.rss)],
                        ["Heap Used", formatBytes(systemHealth.server.memoryUsage.heapUsed)],
                        ["Heap Total", formatBytes(systemHealth.server.memoryUsage.heapTotal)],
                        ["External", formatBytes(systemHealth.server.memoryUsage.external)],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-mono text-xs text-gray-200">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═════════════ ACTIVITY TAB ═════════════ */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {!activity ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Signups */}
                <div className="glass-card p-6 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    👤 Recent Signups ({activity.signups.length})
                  </h3>
                  <div className="space-y-2">
                    {activity.signups.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] text-sm"
                      >
                        <span className="text-green-400 shrink-0">+</span>
                        <span className="text-gray-300 flex-1">{item.message}</span>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {new Date(item.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                    {activity.signups.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent signups</p>
                    )}
                  </div>
                </div>

                {/* Uploads */}
                <div className="glass-card p-6 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    📸 Recent Uploads ({activity.uploads.length})
                  </h3>
                  <div className="space-y-2">
                    {activity.uploads.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] text-sm"
                      >
                        <span className="text-blue-400 shrink-0">📷</span>
                        <span className="text-gray-300 flex-1">{item.message}</span>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {new Date(item.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                    {activity.uploads.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent uploads</p>
                    )}
                  </div>
                </div>

                {/* Outfit Generations */}
                <div className="glass-card p-6 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    ✨ Outfit Generations ({activity.generations.length})
                  </h3>
                  <div className="space-y-2">
                    {activity.generations.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] text-sm"
                      >
                        <span className="text-purple-400 shrink-0">✨</span>
                        <span className="text-gray-300 flex-1">{item.message}</span>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {new Date(item.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                    {activity.generations.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent generations</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Plan Change Modal */}
      {showPlanModal && planModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Change User Plan</h3>
            <p className="text-sm text-gray-400">
              For: <strong>{planModalTarget.display_name || planModalTarget.clerk_id}</strong> (currently: {planModalTarget.plan})
            </p>
            <div className="flex gap-2">
              {["free", "pro", "studio"].map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPlan(p)}
                  className={
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all " +
                    (newPlan === p
                      ? "bg-[#e879f9] text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10")
                  }
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setPlanModalTarget(null);
                }}
                className="flex-1 btn-secondary py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlan}
                disabled={actionLoading || newPlan === planModalTarget.plan}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? "Updating…" : `Change to ${newPlan?.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
