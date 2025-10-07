"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        // Basic guard: do we even have a ?code= param?
        const u = new URL(url);
        const hasCode = !!u.searchParams.get("code");
        if (!hasCode) {
          // User hit this route directly or wrong redirect URL
          router.replace("/signin?error=missing_code");
          return;
        }

        const { error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(url);
        if (exchangeErr) {
          console.error("exchangeCodeForSession error:", exchangeErr.message);
          router.replace("/signin?error=exchange_failed");
          return;
        }

        // Success — go to the app (or `next` if present)
        const next = u.searchParams.get("next") || "/game";
        router.replace(next);
      } catch (e: any) {
        console.error("callback fatal:", e?.message ?? String(e));
        router.replace("/signin?error=callback_fatal");
      }
    };

    if (url) run();
  }, [url, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Completing sign-in…
    </div>
  );
}
