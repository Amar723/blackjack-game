// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ---------------- Types ---------------- */

export interface User {
  id: string;
  email: string;
  chips: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  bet_amount: number;
  player_hand: number[];
  dealer_hand: number[];
  player_total: number;
  dealer_total: number;
  player_cards: number[];
  dealer_cards: number[];
  result: "win" | "lose" | "push";
  delta: number;
  winnings: number;
  created_at: string;
}

/* ---------------- Helpers ---------------- */

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

/** Local calculator so we never send undefined/NULL totals */
function totalFromHand(hand: number[] = []): number {
  // Face cards 11-13 => 10; Ace (1) => 11 initially, then reduce by 10 if bust.
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c === 1) {
      aces++;
      total += 11;
    } else if (c > 10) {
      total += 10;
    } else {
      total += c;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

/**
 * Insert a game row.
 * We compute player_total / dealer_total here to guarantee NOT NULL columns are satisfied.
 */
export const createGame = async (gameData: {
  bet_amount: number;
  player_hand: number[];
  dealer_hand: number[];
  // caller might pass these, but we ignore and compute safely anyway
  player_total?: number;
  dealer_total?: number;
  result: "win" | "lose" | "push";
  winnings: number;
}): Promise<Game | null> => {
  // Ensure we have an authenticated user (RLS requires it)
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();

  if (sessErr) {
    console.error("Auth session error:", sessErr.message);
    return null;
  }
  if (!session?.user) {
    console.error("No authenticated user");
    return null;
  }

  const user = session.user;

  // Compute safe totals (never undefined)
  const safePlayerTotal =
    Number.isFinite(gameData.player_total as number)
      ? (gameData.player_total as number)
      : totalFromHand(gameData.player_hand);

  const safeDealerTotal =
    Number.isFinite(gameData.dealer_total as number)
      ? (gameData.dealer_total as number)
      : totalFromHand(gameData.dealer_hand);

  // Compute chip delta from result
  const delta =
    gameData.result === "win"
      ? gameData.bet_amount
      : gameData.result === "lose"
      ? -gameData.bet_amount
      : 0;

  // Build payload with guaranteed numbers
  const payload = {
    user_id: user.id,
    bet_amount: gameData.bet_amount,
    player_hand: gameData.player_hand ?? [],
    dealer_hand: gameData.dealer_hand ?? [],
    // both totals guaranteed numbers now
    player_total: safePlayerTotal,
    dealer_total: safeDealerTotal,
    // optional mirror fields if they exist in your table (ignored by PostgREST if not)
    player_cards: gameData.player_hand ?? [],
    dealer_cards: gameData.dealer_hand ?? [],
    result: gameData.result,
    delta,
    winnings: gameData.winnings,
  };

  const { data, error } = await supabase
    .from("games")
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Log the exact payload to diagnose column mismatches quickly
    console.error("Supabase createGame payload:", payload);
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
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase getUserGames error:", error.message);
    return [];
  }
  return (data ?? []) as Game[];
};
