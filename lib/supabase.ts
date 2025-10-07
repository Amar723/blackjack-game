import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DB types (align with your tables)
export interface User {
  id: string;
  email: string | null;
  chips: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  bet_amount: number;
  player_hand: number[];  // int4[]
  dealer_hand: number[];  // int4[]
  player_total: number;   // int4
  dealer_total: number;   // int4
  delta: number;          // int4
  result: "win" | "lose" | "push"; // text
  winnings: number;       // int4
  created_at: string;     // timestamptz
  dealer_cards?: unknown; // jsonb (mirrors dealer_hand)
}

/**
 * Ensure a profile row exists for the current session user (idempotent).
 */
export const ensureProfile = async () => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, reason: "no_user" as const };

  // Try to fetch first
  const { data: existing, error: readErr } = await supabase
    .from("profiles")
    .select("id, chips")
    .eq("id", user.id)
    .maybeSingle();

  if (readErr) {
    console.error("profiles read error:", readErr.message);
  }
  if (existing) return { ok: true as const };

  // Upsert (idempotent on PK id)
  const { error: upsertErr } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      chips: 500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upsertErr) {
    console.error("profiles upsert error:", upsertErr.message);
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
    console.error("Supabase getUser error:", error.message);
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
    console.error("Supabase updateUserChips error:", error.message);
    return false;
  }
  return true;
};

export const createGame = async (
  gameData: Omit<Game, "id" | "created_at" | "user_id" | "dealer_cards">
): Promise<Game | null> => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    console.error("Auth error or no user");
    return null;
  }

  const payload = {
    user_id: user.id,
    bet_amount: gameData.bet_amount,
    player_hand: gameData.player_hand,
    dealer_hand: gameData.dealer_hand,
    player_total: gameData.player_total,
    dealer_total: gameData.dealer_total,
    delta: gameData.delta,
    result: gameData.result,
    winnings: gameData.winnings,
    dealer_cards: gameData.dealer_hand, // mirror to jsonb column
  };

  const { data, error } = await supabase
    .from("games")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Supabase createGame error:", error.message);
    return null;
  }
  return data as Game;
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
    console.error("Supabase getUserGames error:", error.message);
    return [];
  }
  return (data ?? []) as Game[];
};
