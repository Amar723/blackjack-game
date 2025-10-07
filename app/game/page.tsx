"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Home, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Hand from "@/components/Hand";
import BettingInterface from "@/components/BettingInterface";
import AIAdvice from "@/components/AIAdvice";
import {
  calculateScore,
  isBusted,
  isBlackjack,
  determineResult,
  calculateWinnings,
  shouldDealerHit,
} from "@/lib/game-logic";
import { dealInitialHands, drawFromDeck, Deck } from "@/lib/deck";
import { supabase, updateUserChips, createGame } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

interface GameState {
  playerHand: number[];
  dealerHand: number[];
  gamePhase: "betting" | "playing" | "dealer" | "finished";
  betAmount: number;
  result: "win" | "lose" | "push" | null;
  chips: number;
  isDealerTurn: boolean;
  // track remaining deck so draws are without replacement
  deck?: Deck;
}

function GameContent() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    dealerHand: [],
    gamePhase: "betting",
    betAmount: 0,
    result: null,
    chips: 500,
    isDealerTurn: false,
  });

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadErr(null);

      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Load timeout after 10s")), 10000)
        );

        const loadPromise = (async () => {
          console.log("🔍 Getting user...");
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          console.log("👤 User result:", {
            user: user?.id,
            error: error?.message,
          });

          if (error) throw error;

          if (!user) {
            console.log("No user found, should redirect");
            setLoading(false);
            return;
          }

          setUserId(user.id);
          setUserEmail(user.email ?? null);

          console.log("📊 Fetching profile for user:", user.id);

          // Try to read chips
          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("chips")
            .eq("id", user.id)
            .maybeSingle();

          console.log("💰 Profile result:", {
            chips: profile?.chips,
            error: pErr?.message,
          });

          if (pErr) {
            console.error("profiles read error:", pErr.message);
            setLoadErr(`Profile read error: ${pErr.message}`);
          } else if (profile?.chips != null) {
            setGameState((prev) => ({ ...prev, chips: profile.chips }));
          } else {
            console.log("🆕 Creating new profile...");
            // create missing profile
            const { error: iErr } = await supabase.from("profiles").insert({
              id: user.id,
              email: user.email,
              chips: 500,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            if (iErr) {
              console.error("profiles insert error:", iErr.message);
              setLoadErr(`Profile insert error: ${iErr.message}`);
            } else {
              console.log("Profile created successfully");
            }
          }
        })();

        await Promise.race([loadPromise, timeoutPromise]);
        console.log("✅ Load complete");
      } catch (e: any) {
        console.error("Error in load:", e?.message ?? String(e));
        setLoadErr(e?.message ?? String(e));
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(false);
      }
    };

    load();
  }, []);

  const handlePlaceBet = (amount: number) => {
    // Use deck utility to deal initial hands without replacement
    const { deck, playerHand, dealerHand } = dealInitialHands();
    setGameState((prev) => ({
      ...prev,
      betAmount: amount,
      gamePhase: "playing",
      playerHand: playerHand as number[],
      dealerHand: dealerHand as number[],
      deck,
    }));
  };

  const handleHit = () => {
    if (gameState.gamePhase !== "playing") return;

    const { card, deck: newDeck } = drawFromDeck(gameState.deck ?? []);
    if (!card) {
      // Deck exhausted — optional: reshuffle. For now, warn and no-op.
      console.warn("Deck exhausted on hit");
      return;
    }

    const newPlayerHand = [...gameState.playerHand, card];
    const playerScore = calculateScore(newPlayerHand);

    setGameState((prev) => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
    }));

    if (playerScore > 21) {
      handleGameEnd("lose");
    }
  };

  const handleStand = () => {
    if (gameState.gamePhase !== "playing") return;
    setGameState((prev) => ({
      ...prev,
      gamePhase: "dealer",
      isDealerTurn: true,
    }));
    dealerPlay();
  };

  const dealerPlay = async () => {
    let dealerHand = [...gameState.dealerHand];
    let currentDeck = gameState.deck ?? [];

    while (shouldDealerHit(dealerHand)) {
      await new Promise((r) => setTimeout(r, 600));
      const { card, deck: newDeck } = drawFromDeck(currentDeck);
      if (!card) {
        console.warn("Deck exhausted during dealer play");
        break;
      }
      dealerHand = [...dealerHand, card];
      currentDeck = newDeck;
      setGameState((prev) => ({ ...prev, dealerHand, deck: currentDeck }));
    }

    const result = determineResult(gameState.playerHand, dealerHand);
    handleGameEnd(result);
  };

  const handleGameEnd = async (result: "win" | "lose" | "push") => {
    const winnings = calculateWinnings(result, gameState.betAmount);
    const newChips = gameState.chips - gameState.betAmount + winnings;

    setGameState((prev) => ({
      ...prev,
      result,
      gamePhase: "finished",
      chips: newChips,
      isDealerTurn: false,
    }));

    if (userId) {
      try {
        await createGame({
          bet_amount: gameState.betAmount,
          player_hand: gameState.playerHand,
          dealer_hand: gameState.dealerHand,
          result,
          winnings,
          user_id: "" as any,
        } as any);

        await updateUserChips(userId, newChips);
      } catch (e) {
        console.error("Error saving game:", e);
      }
    }
  };

  const handleNewGame = () => {
    setGameState((prev) => ({
      playerHand: [],
      dealerHand: [],
      gamePhase: "betting",
      betAmount: 0,
      result: null,
      chips: prev.chips,
      isDealerTurn: false,
    }));
  };

  console.log("🎮 Render state:", { loading, loadErr, userId });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl mb-4">Loading…</div>
          <div className="text-sm text-gray-300">Check console for details</div>
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-xl mb-4">Error Loading Game</div>
          <div className="text-sm text-gray-300 mb-4">{loadErr}</div>
          <Link href="/">
            <Button className="bg-white text-red-900">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const playerScore = calculateScore(gameState.playerHand);
  const dealerScore = calculateScore(gameState.dealerHand);
  const playerBusted = isBusted(gameState.playerHand);
  const dealerBusted = isBusted(gameState.dealerHand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/history">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-700"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black font-bold px-4 py-2"
              >
                Chips: ${gameState.chips}
              </Badge>
              {userEmail && (
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="text-white border-gray-300"
                  >
                    {userEmail}
                  </Badge>
                  <Button
                    onClick={async () => {
                      // Sign out and send user to the signin page.
                      await supabase.auth.signOut();
                      router.replace("/signin");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blackjack</h1>
          <p className="text-gray-300">
            Get as close to 21 as possible without going over!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dealer Hand */}
            <Card className="bg-gray-800 border-gray-700">
              <Hand
                cards={gameState.dealerHand}
                title="Dealer"
                isDealer={true}
                showScore={
                  gameState.gamePhase === "finished" || gameState.isDealerTurn
                }
              />
            </Card>

            {/* Game Status */}
            <AnimatePresence>
              {gameState.gamePhase === "finished" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <h3 className="text-2xl font-bold mb-2 text-white">
                        {gameState.result === "win" && "🎉 You Win!"}
                        {gameState.result === "lose" && "😞 You Lose"}
                        {gameState.result === "push" && "🤝 Push"}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {gameState.result === "win" &&
                          `You won $${gameState.betAmount}!`}
                        {gameState.result === "lose" &&
                          `You lost $${gameState.betAmount}`}
                        {gameState.result === "push" &&
                          "Your bet has been returned"}
                      </p>
                    </motion.div>
                    <Button
                      onClick={handleNewGame}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      New Game
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player Hand */}
            <Card className="bg-gray-800 border-gray-700">
              <Hand
                cards={gameState.playerHand}
                title="Your Hand"
                showScore={true}
              />
            </Card>

            {/* Action Buttons */}
            {gameState.gamePhase === "playing" && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleHit}
                    disabled={playerBusted}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-8"
                    size="lg"
                  >
                    Hit
                  </Button>
                  <Button
                    onClick={handleStand}
                    disabled={playerBusted}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8"
                    size="lg"
                  >
                    Stand
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Betting Interface */}
            {gameState.gamePhase === "betting" && (
              <BettingInterface
                currentChips={gameState.chips}
                onPlaceBet={handlePlaceBet}
              />
            )}

            {/* AI Advice */}
            {gameState.gamePhase === "playing" &&
              gameState.playerHand.length > 0 && (
                <AIAdvice
                  playerHand={gameState.playerHand}
                  dealerCard={gameState.dealerHand[0]}
                />
              )}

            {/* Game Info */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="font-semibold text-white mb-4">Game Rules</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Get as close to 21 as possible</p>
                <p>• Face cards = 10, Ace = 1 or 11</p>
                <p>• Dealer hits on 16, stands on 17</p>
                <p>• Blackjack pays 1:1</p>
                <p>• Push returns your bet</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  // Wrap the actual game content in the client-side AuthGuard so that
  // unauthorized users are redirected to /signin before the page tries
  // to read RLS-protected data.
  return (
    <AuthGuard>
      <GameContent />
    </AuthGuard>
  );
}
