// ─── SQL Injection Prevention Helpers ───────────────────────
// Escapes special LIKE wildcard characters (% _ \) in user input
// before using in ILIKE/LIKE patterns.

export function escapeLikePattern(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
// Simple per-user rate limiter for API endpoints.
// NOTE: For multi-instance deployments, replace with Redis-backed store.

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const limiters = new Map<string, RateLimitEntry>();

/**
 * Check if a user is within their rate limit.
 * @param key - Unique identifier (e.g., userId + endpoint)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns { allowed, retryAfter } — retryAfter is seconds until next slot
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = limiters.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    limiters.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count < maxRequests) {
    entry.count++;
    return { allowed: true, retryAfter: 0 };
  }

  // Rate limited — calculate when the window resets
  const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
  return { allowed: false, retryAfter: Math.max(1, retryAfter) };
}

// Periodic cleanup of stale entries (every 5 min)
const CLEANUP_INTERVAL = 5 * 60_000;
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (limiters as any).forEach((_entry: RateLimitEntry, key: string) => {
    const entry = limiters.get(key)!;
    if (now - entry.windowStart > CLEANUP_INTERVAL) {
      limiters.delete(key);
    }
  });
  }, CLEANUP_INTERVAL);
}
