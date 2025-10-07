// Card representation: 1-13 (Ace=1, 2-10, J=11, Q=12, K=13)
export interface Card {
  value: number;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
}

export interface GameState {
  playerHand: number[];
  dealerHand: number[];
  playerScore: number;
  dealerScore: number;
  gamePhase: "betting" | "playing" | "dealer" | "finished";
  betAmount: number;
  result: "win" | "lose" | "push" | null;
}

// Get card value for scoring (Ace = 1 or 11, face cards = 10)
export const getCardValue = (card: number): number => {
  if (card === 1) return 11; // Ace
  if (card >= 11) return 10; // Face cards
  return card;
};

// Calculate hand score with optimal Ace handling
export const calculateScore = (hand: number[]): number => {
  let score = 0;
  let aces = 0;

  for (const card of hand) {
    if (card === 1) {
      aces++;
      score += 11;
    } else {
      score += getCardValue(card);
    }
  }

  // Convert Aces from 11 to 1 if needed
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
};

// Generate a random card (1-13)
export const drawCard = (): number => {
  return Math.floor(Math.random() * 13) + 1;
};

// Check if hand is busted
export const isBusted = (hand: number[]): boolean => {
  return calculateScore(hand) > 21;
};

// Check if hand is blackjack (21 with exactly 2 cards)
export const isBlackjack = (hand: number[]): boolean => {
  return hand.length === 2 && calculateScore(hand) === 21;
};

// Determine game result
export const determineResult = (
  playerHand: number[],
  dealerHand: number[],
): "win" | "lose" | "push" => {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  const playerBusted = playerScore > 21;
  const dealerBusted = dealerScore > 21;

  if (playerBusted) return "lose";
  if (dealerBusted) return "win";
  if (playerScore > dealerScore) return "win";
  if (playerScore < dealerScore) return "lose";
  return "push";
};

// Calculate winnings based on result and bet
export const calculateWinnings = (
  result: "win" | "lose" | "push",
  betAmount: number,
): number => {
  switch (result) {
    case "win":
      return betAmount * 2; // 1:1 payout
    case "lose":
      return 0;
    case "push":
      return betAmount; // Bet returned
    default:
      return 0;
  }
};

// Dealer AI - must hit on 16 or less, stand on 17 or more
export const shouldDealerHit = (dealerHand: number[]): boolean => {
  const score = calculateScore(dealerHand);
  return score <= 16;
};

// Get card display value for UI
export const getCardDisplayValue = (card: number): string => {
  switch (card) {
    case 1:
      return "A";
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    default:
      return card.toString();
  }
};

// Get card suit for display
export const getCardSuit = (
  card: number,
): "hearts" | "diamonds" | "clubs" | "spades" => {
  const suits: ("hearts" | "diamonds" | "clubs" | "spades")[] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
  ];
  return suits[Math.floor(Math.random() * 4)];
};
