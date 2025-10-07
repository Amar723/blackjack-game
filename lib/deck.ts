// lib/deck.ts
// Simple deck utilities for Blackjack. Ranks are numbers to match existing code:
// 1 = Ace, 2-10 = pip cards, 11=J,12=Q,13=K

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Deck = Rank[];

/** createDeck - returns a fresh 52-card deck (4 of each rank) */
export function createDeck(): Deck {
  const deck: Rank[] = [];
  for (let r = 1; r <= 13; r++) {
    for (let i = 0; i < 4; i++) deck.push(r as Rank);
  }
  return deck;
}

/** shuffleDeck */
export function shuffleDeck(deck: Deck): Deck {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = deck[i];
    deck[i] = deck[j];
    deck[j] = t;
  }
  return deck;
}

/** dealInitialHands - shuffle fresh deck and deal player,dealer in order P D P D */
export function dealInitialHands(): {
  deck: Deck;
  playerHand: Rank[];
  dealerHand: Rank[];
} {
  const deck = shuffleDeck(createDeck());
  const playerHand: Rank[] = [];
  const dealerHand: Rank[] = [];

// Deal two cards each, alternate between the dealer and the player
  playerHand.push(deck.pop() as Rank);
  dealerHand.push(deck.pop() as Rank);
  playerHand.push(deck.pop() as Rank);
  dealerHand.push(deck.pop() as Rank);

  return { deck, playerHand, dealerHand };
}

/** drawFromDeck - draw one card from deck (top = end). Returns card and new deck */
export function drawFromDeck(deck: Deck): { card?: Rank; deck: Deck } {
  const newDeck = deck.slice();
  const card = newDeck.pop();
  return { card: card as Rank | undefined, deck: newDeck };
}
