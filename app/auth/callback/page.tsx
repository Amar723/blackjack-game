"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AuthCallback() {
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (ranRef.current) return;
      ranRef.current = true;

      try {
        // The auth state change will be automatically handled by Supabase
        // We just need to wait a moment for the session to be set, then check for user
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user) {
          console.error("Auth callback getUser error:", userErr?.message);
          router.replace("/signin?error=no_user");
          return;
        }

        // Ensure a profile row exists (id, email, chips)
        const { data: profile, error: readErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (readErr) {
          console.error("Profile read error:", readErr.message);
        }

        if (!profile) {
          const { error: insertErr } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            chips: 500,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          if (insertErr) {
            console.error("Profile create error:", insertErr.message);
          }
        }

        router.replace("/game");
      } catch (e: any) {
        console.error(
          "Unexpected error in auth callback:",
          e?.message ?? String(e)
        );
        router.replace("/signin?error=unexpected");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-white text-xl mt-4">Completing sign in…</p>
      </div>
    </div>
  );
}
