"use client";

import { useEffect, useState, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * AuthGuard
 * - Client-side guard that ensures a Supabase session exists before
 *   rendering protected UI (like /game). If there's no session it
 *   redirects to /signin.
 *
 * Why this is necessary:
 * - Your pages currently try to read RLS-protected tables immediately
 *   on mount. When a user signs out they still remain on the game page
 *   and the page attempts requests with no session — causing errors.
 * - This guard centralizes the check and redirects unauthenticated users
 *   to the sign-in flow, preventing those calls from running.
 *
 * Notes:
 * - This is intentionally client-side so it works with your existing
 *   browser Supabase client created with createBrowserClient.
 * - For stronger protection on the edge (server) you can add middleware
 *   or server-side session checks — an example middleware is included
 *   in the repo as optional.
 */
export default function AuthGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        // Ask Supabase for the current user session.
        // If none found, redirect to /signin.
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // If Supabase returns an auth error, treat as unauthenticated.
          console.error("AuthGuard getUser error:", error.message);
        }

        if (!user && mounted) {
          // Keep a brief visual while routing so UX doesn't flash.
          router.replace("/signin");
          return;
        }
      } catch (e) {
        console.error("AuthGuard unexpected error:", e);
        // On error, redirect to signin to be safe.
        router.replace("/signin");
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    // Subscribe to auth state changes so that if the user signs out
    // while on a protected page we immediately redirect.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.replace("/signin");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    // Keep the app's style consistent while we verify the session.
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700">
          <div className="text-center">
            <div className="text-white text-lg mb-4">
              Checking authentication…
            </div>
            <Button
              onClick={() => router.replace("/signin")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Go to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User is authenticated — render protected children.
  return <>{children}</>;
}
