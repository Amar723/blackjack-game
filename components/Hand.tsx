"use client";

import { motion } from "framer-motion";
import Card from "./Card";
import { calculateScore } from "@/lib/game-logic";

interface HandProps {
  cards: number[];
  title: string;
  isDealer?: boolean;
  showScore?: boolean;
  className?: string;
}

export default function Hand({
  cards,
  title,
  isDealer = false,
  showScore = true,
  className = "",
}: HandProps) {
  const score = calculateScore(cards);
  const isBusted = score > 21;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showScore && (
          <p
            className={`text-sm font-medium ${
              isBusted
                ? "text-red-400"
                : score === 21
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            Score: {score}{" "}
            {isBusted ? "(BUST!)" : score === 21 ? "(BLACKJACK!)" : ""}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 lg:gap-2">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ x: -100, y: -50, opacity: 0, rotate: -10 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.3,
              type: "spring",
              stiffness: 80,
              damping: 12,
            }}
            whileHover={{
              y: -10,
              transition: { duration: 0.2 },
            }}
          >
            <Card value={card} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
