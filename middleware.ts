import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Clean middleware implementation:
 * - Uses Supabase server client to detect a logged-in user from cookies.
 * - Redirects unauthenticated users away from protected routes (/game, /history)
 * - Redirects authenticated users away from /signin to /game
 *
 * Note: The cookie helpers passed to createServerClient only need a `get`
 * implementation for our read-only check. set/delete are no-ops here.
 */

export async function middleware(request: NextRequest) {
  // Mirror request so we can pass headers through if necessary.
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request. createServerClient will
        // use this to read the Supabase session if present.
        get: (name: string) => request.cookies.get(name)?.value ?? null,
        // These are no-ops in middleware; we don't set cookies here.
        set: (_name: string, _value: string) => {},
        remove: (_name: string) => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Allow the OAuth callback path to pass through unmodified.
  if (path.startsWith("/auth/callback")) return response;

  // If an unauthenticated user tries to visit protected routes, redirect to /signin
  if (!user && (path.startsWith("/game") || path.startsWith("/history"))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If an authenticated user hits /signin, send them to /game
  if (user && path.startsWith("/signin")) {
    return NextResponse.redirect(new URL("/game", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/auth/callback/:path*", "/game/:path*", "/history/:path*", "/signin/:path*"],
};
