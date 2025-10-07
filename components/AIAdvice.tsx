"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Brain, AlertCircle } from "lucide-react";
import { getBlackjackAdvice } from "@/lib/gemini"; // keep the helper in /lib

interface AIAdviceProps {
  playerHand: number[];
  dealerCard: number;
  className?: string;
}

export default function AIAdvice({
  playerHand,
  dealerCard,
  className = "",
}: AIAdviceProps) {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setError("");
    setAdvice("");

    try {
      const aiAdvice = await getBlackjackAdvice(playerHand, dealerCard);
      setAdvice(aiAdvice);
    } catch (err) {
      console.error("AI Advice Error:", err);
      setError(
        "Unable to get AI advice. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Button
        onClick={handleGetAdvice}
        disabled={isLoading || playerHand.length === 0}
        className="w-full"
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting AI Advice...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Ask AI for Strategy
          </>
        )}
      </Button>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {advice && !error && (
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">
                AI Strategy Advice
              </h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {advice}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
