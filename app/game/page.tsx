"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export const dynamic = "force-dynamic";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Home, History } from "lucide-react";
import Link from "next/link";

import Hand from "@/components/Hand";
import BettingInterface from "@/components/BettingInterface";
import AIAdvice from "@/components/AIAdvice";
import {
  calculateScore,
  isBusted,
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

  // Load user and chips
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadErr(null);

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Load timeout after 10s")), 10000)
        );

        const loadPromise = (async () => {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error) throw error;
          if (!user) return setLoading(false);

          setUserId(user.id);
          setUserEmail(user.email ?? null);

          const { data: profile, error: pErr } = await supabase
            .from("profiles")
            .select("chips")
            .eq("id", user.id)
            .maybeSingle();

          if (pErr) {
            setLoadErr(`Profile read error: ${pErr.message}`);
          } else if (profile?.chips != null) {
            setGameState((prev) => ({ ...prev, chips: profile.chips }));
          } else {
            await supabase.from("profiles").insert({
              id: user.id,
              email: user.email,
              chips: 500,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        })();

        await Promise.race([loadPromise, timeoutPromise]);
      } catch (e: any) {
        setLoadErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** -----------------------------
   *  Game actions
   * ----------------------------- */

  const handlePlaceBet = (amount: number) => {
    const { deck, playerHand, dealerHand } = dealInitialHands();
    setGameState((prev) => ({
      ...prev,
      betAmount: amount,
      gamePhase: "playing",
      playerHand,
      dealerHand,
      deck,
    }));
  };

  const handleHit = () => {
    if (gameState.gamePhase !== "playing") return;

    const { card, deck: newDeck } = drawFromDeck(gameState.deck ?? []);
    if (!card) return console.warn("Deck exhausted on hit");

    const newPlayerHand = [...gameState.playerHand, card];
    const playerScore = calculateScore(newPlayerHand);

    setGameState((prev) => ({
      ...prev,
      playerHand: newPlayerHand,
      deck: newDeck,
    }));

    if (playerScore > 21) handleGameEnd("lose", gameState.dealerHand);
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
      if (!card) break;
      dealerHand = [...dealerHand, card];
      currentDeck = newDeck;
      setGameState((prev) => ({ ...prev, dealerHand, deck: currentDeck }));
    }

    const result = determineResult(gameState.playerHand, dealerHand);
    handleGameEnd(result, dealerHand);
  };

  const handleGameEnd = async (
    result: "win" | "lose" | "push",
    finalDealerHand?: number[]
  ) => {
    const finalDealer = finalDealerHand ?? gameState.dealerHand;
    const player_total = calculateScore(gameState.playerHand);
    const dealer_total = calculateScore(finalDealer);
    const winnings = calculateWinnings(result, gameState.betAmount);
    const delta = winnings - gameState.betAmount;
    const newChips = gameState.chips + delta;

    setGameState((prev) => ({
      ...prev,
      result,
      gamePhase: "finished",
      chips: newChips,
      isDealerTurn: false,
      dealerHand: finalDealer,
    }));

    if (userId) {
      try {
        await createGame({
          bet_amount: gameState.betAmount,
          player_hand: gameState.playerHand,
          dealer_hand: finalDealer,
          player_total,
          dealer_total,
          delta,
          result,
          winnings,
        } as any);

        await updateUserChips(userId, newChips);
      } catch (e) {
        console.error("Error saving game:", e);
      }
    }
  };

  const handleNewGame = () =>
    setGameState((prev) => ({
      playerHand: [],
      dealerHand: [],
      gamePhase: "betting",
      betAmount: 0,
      result: null,
      chips: prev.chips,
      isDealerTurn: false,
    }));

  /** -----------------------------
   *  Rendering
   * ----------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-2">Loading…</p>
          <p className="text-sm text-gray-300">Check console for details</p>
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-xl mb-4">Error Loading Game</h1>
          <p className="text-sm text-gray-300 mb-4">{loadErr}</p>
          <Link href="/">
            <Button className="bg-white text-red-900">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const playerBusted = isBusted(gameState.playerHand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-gray-700">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="text-white hover:bg-gray-700">
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
                <Badge variant="outline" className="text-white border-gray-300">
                  {userEmail}
                </Badge>
                <Button
                  onClick={async () => {
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
      </header>

      {/* Main game area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blackjack</h1>
          <p className="text-gray-300">
            Get as close to 21 as possible without going over!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gray-800 border-gray-700">
              <Hand
                cards={gameState.dealerHand}
                title="Dealer"
                isDealer
                showScore={
                  gameState.gamePhase === "finished" || gameState.isDealerTurn
                }
              />
            </Card>

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

            <Card className="bg-gray-800 border-gray-700">
              <Hand cards={gameState.playerHand} title="Your Hand" showScore />
            </Card>

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
            {gameState.gamePhase === "betting" && (
              <BettingInterface
                currentChips={gameState.chips}
                onPlaceBet={handlePlaceBet}
              />
            )}

            {gameState.gamePhase === "playing" &&
              gameState.playerHand.length > 0 && (
                <AIAdvice
                  playerHand={gameState.playerHand}
                  dealerCard={gameState.dealerHand[0]}
                />
              )}

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
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <AuthGuard>
      <GameContent />
    </AuthGuard>
  );
}
