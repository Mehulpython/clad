// ─── POST /api/chat ─────────────────────────────────────────
// Style Coach: Conversational AI stylist that answers outfit questions
// based on the user's actual wardrobe, weather, and preferences.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAIClient, withRetry } from "@/lib/vision";
import { mapWardrobeRows } from "@/lib/mappers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = checkRateLimit(`${userId}:chat`, 20);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const body = await req.json();
    const userMessage = body.message as string;
    const conversationHistory = body.history as Array<{ role: string; content: string }> | undefined;

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await getSupabase();

    // Fetch user's wardrobe (for context)
    const { data: rawItems } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .limit(100);

    const wardrobe = rawItems ? mapWardrobeRows(rawItems as Array<Record<string, unknown>>) : [];

    // Fetch user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    // Build wardrobe summary for AI context
    const wardrobeSummary = wardrobe.length > 0
      ? wardrobe.map((item) =>
          `${item.suggestedName || item.itemType} (${item.primaryColor}, ${item.category}, formality: ${item.formalityLevel}/5)${item.isFavorite ? " ❤️" : ""}`
        ).join("\n")
      : "Wardrobe is currently empty.";

    // Build style profile
    const stylePrefs = (profile as Record<string, unknown>)?.style_preferences as Record<string, unknown> | undefined;
    const preferredStyle = stylePrefs?.preferredStyle || "casual";
    const bodyType = (profile as Record<string, unknown>)?.body_type || "unknown";
    const skinTone = (profile as Record<string, unknown>)?.skin_tone || "unknown";

    // Build system prompt
    const systemPrompt = `You are Clad's AI Style Coach — a friendly, opinionated personal stylist integrated into a smart wardrobe app.

USER'S WARDROBE (${wardrobe.length} items):
${wardrobeSummary}

USER PROFILE:
- Preferred style: ${preferredStyle}
- Body type: ${bodyType}
- Skin tone: ${skinTone}

YOUR ROLE:
- Answer questions about what to wear, styling advice, color matching, outfit ideas
- Reference SPECIFIC items from their wardrobe when giving advice
- Be conversational, warm, and concise (2-4 sentences usually)
- If they ask about something they don't own, suggest alternatives from their wardrobe
- If weather is mentioned, factor it into your advice
- Be honest but encouraging — help them look their best

Keep responses short and punchy. Use emojis sparingly. No markdown headers.`;

    // Build messages array
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 6 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: userMessage });

    // Call AI
    try {
      const client = getOpenAIClient();
      const response = await withRetry(() =>
        client.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 400,
          temperature: 0.8,
        })
      );

      const reply = response.choices[0]?.message?.content || "I'm not sure how to help with that — try asking about outfits or styling!";

      return NextResponse.json({
        reply,
        wardrobeContext: wardrobe.length,
      });
    } catch (aiError) {
      console.error("[chat] AI call failed:", aiError);
      return NextResponse.json({
        reply: "I'm having trouble thinking right now 😅 Please try again in a moment!",
        wardrobeContext: wardrobe.length,
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
