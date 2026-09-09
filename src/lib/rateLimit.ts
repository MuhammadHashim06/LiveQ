type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// ponytail: process-local limiter; use Redis when multiple app instances need shared limits.
export function rateLimit(key: string, max: number, windowMs: number) {
    const now = Date.now();
    if (buckets.size > 10_000) {
        for (const [bucketKey, bucket] of buckets) {
            if (bucket.resetAt <= now) buckets.delete(bucketKey);
        }
        while (buckets.size > 10_000) {
            const oldest = buckets.keys().next().value;
            if (typeof oldest !== "string") break;
            buckets.delete(oldest);
        }
    }
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    return {
        allowed: bucket.count <= max,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
}

export function getClientIp(req: Request): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")
        || "unknown";
}
