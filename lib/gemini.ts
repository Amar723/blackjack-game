export async function getBlackjackAdvice(
  playerHand: number[],
  dealerCard: number
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key not found. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local");

  const playerTotal = calculateHandTotal(playerHand);

  const prompt = `You are a professional blackjack advisor helping a beginner player.

Current Game State:
- Player's hand: ${formatHand(playerHand)} (Total: ${playerTotal})
- Dealer's visible card: ${formatCard(dealerCard)}

Provide advice on whether the player should HIT or STAND. Your response should:
1) Start with a clear recommendation: "You should HIT" or "You should STAND"
2) Explain why in 20–30 words using simple, beginner-friendly terms
3) Avoid complex gambling terminology
4) Be encouraging and educational`;

  // Use a model you have access to
  const endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",               // ✅ include a role
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      // Optional: loosen safety if you’re getting over-blocked for gambling keywords
      // safetySettings: [
      //   { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      // ]
    }),
  });

  if (!res.ok) {
    let msg = `API request failed: ${res.status}`;
    try {
      const err = await res.json();
      console.error("Gemini API error:", err);
      if (err?.error?.message) msg += ` - ${err.error.message}`;
    } catch {}
    if (res.status === 403) msg = "Permission denied. Enable 'Generative Language API' for this project.";
    if (res.status === 404) msg = "Model not found for this key. Try gemini-2.5-flash (which your key lists).";
    throw new Error(msg);
  }

  const data = await res.json();

  // Helpful diagnostics in dev
  if (process.env.NODE_ENV !== "production") {
    console.debug("Gemini raw response:", data);
  }

  // Surface finish reason & safety blocks
  const cand = data?.candidates?.[0];
  const finish = cand?.finishReason;
  if (finish && finish !== "STOP") {
    const safety = cand?.safetyRatings?.map((r: any) => `${r.category}:${r.probability}`).join(", ");
    throw new Error(
      `Model didn’t return text (finishReason=${finish}${safety ? `; safety=${safety}` : ""}).`
    );
  }

  // Robust text extraction
  const text =
    cand?.content?.parts
      ?.map((p: any) => p?.text)
      .filter(Boolean)
      .join("\n")
    ?? "";

  if (!text.trim()) {
    // Some responses tuck text under candidates[0].content (rare). Try a couple fallbacks:
    const fallback =
      (cand?.content && typeof cand.content === "string" ? cand.content : "") ||
      data?.text ||
      "";
    if (!fallback.trim()) {
      throw new Error("No response text from model.");
    }
    return fallback.trim();
  }

  return text.trim();
}

/* ---- helpers (unchanged) ---- */
function calculateHandTotal(hand: number[]): number {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c === 1) { aces++; total += 11; }
    else if (c > 10) total += 10;
    else total += c;
  }
  while (total > 21 && aces-- > 0) total -= 10;
  return total;
}
function formatCard(card: number): string {
  if (card === 1) return "Ace";
  if (card === 11) return "Jack";
  if (card === 12) return "Queen";
  if (card === 13) return "King";
  return String(card);
}
function formatHand(hand: number[]): string {
  return hand.map(formatCard).join(", ");
}
