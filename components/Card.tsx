"use client";

import { motion } from "framer-motion";
import { getCardDisplayValue, getCardSuit } from "@/lib/game-logic";

interface CardProps {
  value: number;
  suit?: "hearts" | "diamonds" | "clubs" | "spades";
  isHidden?: boolean;
  className?: string;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-black",
  spades: "text-black",
};

export default function Card({
  value,
  suit,
  isHidden = false,
  className = "",
}: CardProps) {
  const displayValue = getCardDisplayValue(value);
  const cardSuit = suit || getCardSuit(value);
  const isRed = cardSuit === "hearts" || cardSuit === "diamonds";

  if (isHidden) {
    return (
      <motion.div
        initial={{ rotateY: 0, scale: 0.8 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-gray-300 shadow-lg flex items-center justify-center ${className}`}
      >
        <div className="text-white text-2xl font-bold">?</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.2 },
      }}
      className={`w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-lg border-2 border-gray-300 shadow-xl flex flex-col justify-between p-1 sm:p-2 hover:shadow-2xl transition-shadow duration-300 overflow-hidden ${className}`}
      style={{
        minWidth: "3.5rem",
        minHeight: "5rem",
        maxWidth: "4.5rem",
        maxHeight: "6rem",
      }}
    >
      {/* Top-left corner */}
      <div className="flex flex-col items-start w-full">
        <div
          className={`font-bold ${
            isRed ? "text-red-600" : "text-black"
          } text-xs sm:text-sm max-w-full truncate text-center`}
          style={{ wordBreak: "break-word" }}
        >
          {displayValue}
        </div>
        <div
          className={`text-xs max-w-full truncate text-center ${
            isRed ? "text-red-600" : "text-black"
          }`}
        >
          {suitSymbols[cardSuit]}
        </div>
      </div>

      {/* Center symbol */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className={`text-lg sm:text-2xl ${
            isRed ? "text-red-600" : "text-black"
          } max-w-full truncate text-center`}
          style={{ wordBreak: "break-word" }}
        >
          {suitSymbols[cardSuit]}
        </div>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className="flex flex-col items-end w-full transform rotate-180">
        <div
          className={`font-bold ${
            isRed ? "text-red-600" : "text-black"
          } text-xs sm:text-sm max-w-full truncate text-center`}
          style={{ wordBreak: "break-word" }}
        >
          {displayValue}
        </div>
        <div
          className={`text-xs max-w-full truncate text-center ${
            isRed ? "text-red-600" : "text-black"
          }`}
        >
          {suitSymbols[cardSuit]}
        </div>
      </div>
    </motion.div>
  );
}
