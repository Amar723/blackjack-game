"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { supabase, getUserGames } from "@/lib/supabase";

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  pushes: number;
  totalWagered: number;
  totalWinnings: number;
  biggestWin: number;
  winRate: number;
}

export default function HistoryPage() {
  const [games, setGames] = useState<any[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    totalWagered: 0,
    totalWinnings: 0,
    biggestWin: 0,
    winRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndLoadGames();
  }, []);

  const checkUserAndLoadGames = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const userGames = await getUserGames(user.id);
        setGames(userGames);
        calculateStats(userGames);
      }
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (games: any[]) => {
    const totalGames = games.length;
    const wins = games.filter((g) => g.result === "win").length;
    const losses = games.filter((g) => g.result === "lose").length;
    const pushes = games.filter((g) => g.result === "push").length;
    const totalWagered = games.reduce((sum, g) => sum + g.bet_amount, 0);
    const totalWinnings = games.reduce((sum, g) => sum + g.winnings, 0);
    const biggestWin = Math.max(...games.map((g) => g.winnings), 0);
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    setStats({
      totalGames,
      wins,
      losses,
      pushes,
      totalWagered,
      totalWinnings,
      biggestWin,
      winRate,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "win":
        return <Badge className="bg-green-100 text-green-800">Win</Badge>;
      case "lose":
        return <Badge className="bg-red-100 text-red-800">Loss</Badge>;
      case "push":
        return <Badge className="bg-gray-100 text-gray-800">Push</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getHandDisplay = (hand: number[]) => {
    return hand
      .map((card) => {
        if (card === 1) return "A";
        if (card === 11) return "J";
        if (card === 12) return "Q";
        if (card === 13) return "K";
        return card.toString();
      })
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/game">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-700"
                >
                  Play Game
                </Button>
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-white border-gray-300">
                  {user.email}
                </Badge>
                <Button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game History</h1>
          <p className="text-gray-300">Track your blackjack performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Overall Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Games:</span>
                  <span className="font-semibold text-white">
                    {stats.totalGames}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="font-semibold text-yellow-400">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Wins:</span>
                  <span className="font-semibold text-yellow-400">
                    {stats.wins}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Losses:</span>
                  <span className="font-semibold text-red-400">
                    {stats.losses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pushes:</span>
                  <span className="font-semibold text-gray-300">
                    {stats.pushes}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                Financial Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Wagered:</span>
                  <span className="font-semibold text-white">
                    ${stats.totalWagered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Winnings:</span>
                  <span className="font-semibold text-yellow-400">
                    ${stats.totalWinnings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Net Result:</span>
                  <span
                    className={`font-semibold ${
                      stats.totalWinnings - stats.totalWagered >= 0
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    ${stats.totalWinnings - stats.totalWagered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Biggest Win:</span>
                  <span className="font-semibold text-yellow-400">
                    ${stats.biggestWin}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Game History Table */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                  Recent Games
                </h3>

                {games.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No games played yet.</p>
                    <Link href="/game">
                      <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                        Start Playing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white font-bold">
                            Date
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Bet
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Your Hand
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Dealer Hand
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Result
                          </TableHead>
                          <TableHead className="text-white font-bold">
                            Winnings
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell className="text-sm text-white">
                              {formatDate(game.created_at)}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              ${game.bet_amount}
                            </TableCell>
                            <TableCell className="text-sm text-white">
                              {getHandDisplay(game.player_hand)}
                            </TableCell>
                            <TableCell className="text-sm text-white">
                              {getHandDisplay(game.dealer_hand)}
                            </TableCell>
                            <TableCell>{getResultBadge(game.result)}</TableCell>
                            <TableCell
                              className={`font-medium ${
                                game.winnings > game.bet_amount
                                  ? "text-green-400"
                                  : game.winnings === game.bet_amount
                                  ? "text-gray-300"
                                  : "text-red-400"
                              } text-white`}
                            >
                              ${game.winnings}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
