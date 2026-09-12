import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_CONFIGS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/assessments/generate": { maxRequests: 10, windowMs: 60 * 1000 },
  "/api/github/sync": { maxRequests: 8, windowMs: 60 * 1000 },
  "/api/recruitment/drives": { maxRequests: 20, windowMs: 60 * 1000 },
  "/api/team-verification": { maxRequests: 15, windowMs: 60 * 1000 },
};

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Find matching rate limit config
  const matchedKey = Object.keys(RATE_LIMIT_CONFIGS).find((prefix) =>
    path.startsWith(prefix)
  );

  if (matchedKey && request.method !== "GET") {
    const config = RATE_LIMIT_CONFIGS[matchedKey];
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const key = `${ip}:${matchedKey}`;

    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs });
    } else {
      record.count += 1;
      if (record.count > config.maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please slow down.",
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString(),
              "X-RateLimit-Limit": config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export default proxy;

export const config = {
  matcher: "/api/:path*",
};
