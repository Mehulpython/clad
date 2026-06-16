"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTED_PROMPTS = [
  "What should I wear today?",
  "Create an outfit for a date night",
  "What's missing from my wardrobe?",
  "How can I style my white sneakers?",
];

export default function StyleCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Chat failed (${res.status})`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("Chat error:", e);
      toast.error(e instanceof Error ? e.message : "Style Coach is unavailable");
      // Add fallback message
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm having trouble right now. Try again in a moment! 😅",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  // Floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Style Coach chat"
        style={{
          position: "fixed",
          bottom: 80,
          right: 24,
          zIndex: 100,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          boxShadow: "0 4px 24px rgba(190,24,93,0.3)",
          transition: "transform 200ms ease, box-shadow 200ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        💬
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        zIndex: 100,
        width: 380,
        maxWidth: "calc(100vw - 32px)",
        height: 520,
        maxHeight: "calc(100vh - 120px)",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slideUp 250ms ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", margin: 0 }}>Style Coach</p>
            <p style={{ fontSize: 11, opacity: 0.8, fontFamily: "var(--font-body)", margin: 0 }}>Your AI stylist</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close chat"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            color: "white",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "var(--color-bg)",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👗</div>
            <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 6 }}>
              Hey! I'm your Style Coach
            </p>
            <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)", lineHeight: 1.5, marginBottom: 20 }}>
              Ask me about outfits, styling tips, or what to wear today!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-muted)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    color: "var(--color-foreground)",
                    textAlign: "left",
                    transition: "all 150ms ease",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: msg.role === "user"
                  ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                  : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                background: msg.role === "user"
                  ? "var(--color-primary)"
                  : "var(--color-surface)",
                color: msg.role === "user" ? "white" : "var(--color-foreground)",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                lineHeight: 1.5,
                border: msg.role === "user" ? "none" : "1px solid var(--color-border)",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-muted-foreground)",
                    opacity: 0.5,
                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          display: "flex",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask about styling..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            background: "var(--color-muted)",
            fontSize: 13,
            fontFamily: "var(--font-body)",
            color: "var(--color-foreground)",
            outline: "none",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-primary)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "white",
            opacity: loading || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
