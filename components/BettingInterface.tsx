"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BettingInterfaceProps {
  currentChips: number;
  onPlaceBet: (amount: number) => void;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function BettingInterface({
  currentChips,
  onPlaceBet,
  className = "",
}: BettingInterfaceProps) {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [customBet, setCustomBet] = useState<string>("");

  const quickBets = useMemo(() => [10, 25, 50, 100, 250, 500], []);

  const chipsIsZero = currentChips <= 0;

  const setBetSafely = (amount: number) => {
    if (Number.isFinite(amount)) {
      setBetAmount(clamp(Math.floor(amount), 1, Math.max(1, currentChips)));
    }
  };

  const handleQuickBet = (amount: number) => {
    setCustomBet("");
    setBetSafely(amount);
  };

  const parseCustom = () => {
    const n = Number(customBet);
    return Number.isFinite(n) ? Math.floor(n) : NaN;
  };

  const customValid = (() => {
    const n = parseCustom();
    return Number.isFinite(n) && n >= 1 && n <= currentChips;
  })();

  const handleCustomBet = () => {
    if (!customValid) return;
    setBetSafely(parseCustom());
  };

  const handlePlaceBet = () => {
    if (chipsIsZero) return;
    if (betAmount >= 1 && betAmount <= currentChips) {
      onPlaceBet(betAmount);
    }
  };

  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Place Your Bet</h2>
        <p className="text-gray-300">
          Chips Available:{" "}
          <span className="font-semibold text-yellow-400">{currentChips}</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* Quick bet buttons */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">
            Quick Bets
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {quickBets.map((amount) => {
              const selected = betAmount === amount;
              const disabled = amount > currentChips || chipsIsZero;
              return (
                <Button
                  key={amount}
                  type="button" // prevent implicit form submit
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickBet(amount)}
                  disabled={disabled}
                  className="text-sm"
                >
                  ${amount}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom bet input */}
        <div>
          <Label
            htmlFor="custom-bet"
            className="text-sm font-medium text-gray-300 mb-2 block"
          >
            Custom Bet
          </Label>
          <div className="flex space-x-2">
            <Input
              id="custom-bet"
              type="number"
              placeholder="Enter amount"
              value={customBet}
              onChange={(e) => setCustomBet(e.target.value)}
              onKeyDown={(e) => {
                // Allow Enter to set without submitting any parent form
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomBet();
                }
              }}
              min={1}
              max={currentChips}
              className="flex-1"
            />
            <Button
              type="button" // prevent implicit form submit
              onClick={handleCustomBet}
              variant="outline"
              disabled={!customValid || chipsIsZero}
            >
              Set
            </Button>
          </div>
          {!customValid && customBet !== "" && (
            <p className="mt-2 text-xs text-red-400">
              Enter a value between 1 and {currentChips}.
            </p>
          )}
        </div>

        {/* Current bet display and place bet button */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-300">Current Bet</p>
            <p className="text-2xl font-bold text-yellow-400">${betAmount}</p>
          </div>

          <Button
            type="button" // prevent implicit form submit
            onClick={handlePlaceBet}
            disabled={chipsIsZero || betAmount < 1 || betAmount > currentChips}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
            size="lg"
          >
            Place Bet &amp; Deal Cards
          </Button>
        </div>
      </div>
    </div>
  );
}
