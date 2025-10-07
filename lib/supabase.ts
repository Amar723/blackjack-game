// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

/** Single browser client (no SSR secrets) */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* =======================
 * DB Types (mirror tables)
 * ======================= */

export interface User {
  id: string;
  email: string | null;      // we keep email in profiles
  chips: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  bet_amount: number;
  player_hand: number[];     // int4[]
  dealer_hand: number[];     // int4[]
  player_total: number;      // int4
  dealer_total: number;      // int4
  delta: number;             // int4
  result: "win" | "lose" | "push"; // text
  winnings: number;          // int4
  created_at: string;        // timestamptz
  dealer_cards?: unknown;    // jsonb (optional mirror of dealer_hand)
}

/* =======================
 * Profiles helpers
 * ======================= */

/** Ensure a profile row exists for the current auth user (idempotent). */
export const ensureProfile = async () => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    console.error("ensureProfile: no auth user", authErr?.message);
    return { ok: false as const, reason: "no_user" as const };
  }

  // Try fetch
  const { data: existing, error: readErr } = await supabase
    .from("profiles")
    .select("id, chips")
    .eq("id", user.id)
    .maybeSingle();

  if (readErr) {
    console.error("ensureProfile read error:", {
      message: readErr.message,
      code: (readErr as any).code,
      details: (readErr as any).details,
      hint: (readErr as any).hint,
    });
  }
  if (existing) return { ok: true as const };

  // Insert a starter row (include email because you want it in profiles)
  const { error: upsertErr } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email, // <- requires profiles.email text column
      chips: 500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upsertErr) {
    console.error("ensureProfile upsert error:", {
      message: upsertErr.message,
      code: (upsertErr as any).code,
      details: (upsertErr as any).details,
      hint: (upsertErr as any).hint,
    });
    return { ok: false as const, reason: "upsert_failed" as const };
  }
  return { ok: true as const };
};

export const getUser = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getUser error:", {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return null;
  }
  return data as any;
};

export const updateUserChips = async (
  userId: string,
  newChipAmount: number
): Promise<boolean> => {
  const { error } = await supabase
    .from("profiles")
    .update({ chips: newChipAmount, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("updateUserChips error:", {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return false;
  }
  return true;
};

/* =======================
 * Games helpers
 * ======================= */

/**
 * Create a game row for the logged-in user.
 * Robust to schemas WITHOUT `dealer_cards` (retries without it).
 */
export const createGame = async (
  gameData: Omit<Game, "id" | "created_at" | "user_id" | "dealer_cards">
): Promise<Game | null> => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    console.error("createGame: no auth user", authErr?.message);
    return null;
  }

  // Full payload including optional mirror jsonb
  const payloadWithMirror = {
    user_id: user.id,
    bet_amount: gameData.bet_amount,
    player_hand: gameData.player_hand,
    dealer_hand: gameData.dealer_hand,
    player_total: gameData.player_total,
    dealer_total: gameData.dealer_total,
    delta: gameData.delta,
    result: gameData.result,
    winnings: gameData.winnings,
    dealer_cards: gameData.dealer_hand, // some DBs will have this jsonb, some won't
  } as const;

  // Minimal payload that works on schemas without dealer_cards
  const payloadMinimal = {
    user_id: user.id,
    bet_amount: gameData.bet_amount,
    player_hand: gameData.player_hand,
    dealer_hand: gameData.dealer_hand,
    player_total: gameData.player_total,
    dealer_total: gameData.dealer_total,
    delta: gameData.delta,
    result: gameData.result,
    winnings: gameData.winnings,
  } as const;

  // First try WITH dealer_cards; if the column doesn't exist, retry WITHOUT
  let insertRes = await supabase
    .from("games")
    .insert(payloadWithMirror)
    .select()
    .single();

  if (insertRes.error) {
    const msg = (insertRes.error as any).message?.toLowerCase() ?? "";
    const details = (insertRes.error as any).details?.toLowerCase() ?? "";
    const columnMissing =
      msg.includes('column "dealer_cards"') ||
      details.includes('column "dealer_cards"');

    if (columnMissing) {
      // Retry without the jsonb column
      insertRes = await supabase
        .from("games")
        .insert(payloadMinimal)
        .select()
        .single();
    }

    if (insertRes.error) {
      console.error("createGame insert error:", {
        message: insertRes.error.message,
        code: (insertRes.error as any).code,
        details: (insertRes.error as any).details,
        hint: (insertRes.error as any).hint,
        triedPayload: columnMissing ? "minimal" : "with_mirror",
      });
      return null;
    }
  }

  return insertRes.data as Game;
};

export const getUserGames = async (
  userId: string,
  limit = 50
): Promise<Game[]> => {
  const { data, error } = await supabase
    .from("games")
    .select(
      "id,user_id,bet_amount,player_hand,dealer_hand,player_total,dealer_total,delta,result,winnings,created_at,dealer_cards"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getUserGames error:", {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
      hint: (error as any).hint,
    });
    return [];
  }
  return (data ?? []) as Game[];
};
