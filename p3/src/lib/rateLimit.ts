/**
 * Simple in-memory rate limiter: 10 requests / 60 s per IP.
 *
 * NOTE: In serverless environments (e.g. Vercel) each function cold-start gets
 * its own memory, so limits are per-instance rather than global. For
 * high-traffic production use, replace with a Redis-backed solution such as
 * @upstash/ratelimit + @upstash/redis.
 */

const WINDOW_MS = 60_000;   // 1 minute
const MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now >= entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { allowed: false, retryAfterMs: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, retryAfterMs: 0 };
}
