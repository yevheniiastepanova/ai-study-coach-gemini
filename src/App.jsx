import { useState } from "react";
import "./App.css";

// ---------- SUBJECTS (режимы-туторы) ----------
const SUBJECTS = [
  {
    id: "math",
    title: "Math Tutor",
    prompt: "You are a friendly math tutor who explains everything step-by-step.",
  },
  {
    id: "coding",
    title: "Coding Mentor",
    prompt:
      "You are a helpful programming mentor who explains code clearly and gives examples.",
  },
  {
    id: "english",
    title: "English Writing Coach",
    prompt:
      "You are an English writing assistant who improves clarity and rewrites sentences.",
  },
  {
    id: "science",
    title: "Science Explainer",
    prompt:
      "You are a science tutor who explains concepts in simple, beginner-friendly terms.",
  },
];

// формат времени
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // =============== SEND MESSAGE =============== //
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !mode) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: formatTime(new Date()),
    };

    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt =
        SUBJECTS.find((s) => s.id === mode)?.prompt || "";

      // 🔒 ВСЕГДА через backend
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Instruction: ${systemPrompt}\n\nUser: ${trimmed}`,
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      const reply = data.text;

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        timestamp: formatTime(new Date()),
      };

      setMessages((m) => [...m, aiMessage]);
    } catch (err) {
      console.error(err);

      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 5,
          role: "assistant",
          content: "Oops! Something went wrong. Try again.",
          timestamp: formatTime(new Date()),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =============== ENTER TO SEND =============== //
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => setMessages([]);

  // =============== SUBJECT SELECTION SCREEN =============== //
  if (!mode) {
    return (
      <div className="app-aura-bg">
        <div className="aura-orb orb-1" />
        <div className="aura-orb orb-2" />
        <div className="aura-orb orb-3" />

        <div className="aura-shell container">
          <div className="brand-badge mb-3">AI Study Coach</div>

          <h1 className="aura-title mb-2">Choose your study coach</h1>
          <p className="aura-subtitle mb-4">
            Pick a mode and let your personal AI tutor help you study smarter.
          </p>

          <div className="subject-grid">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="subject-card"
                onClick={() => {
                  setMode(s.id);
                  setMessages([]);
                }}
              >
                <div className="subject-pill-icon">
                  {s.title.charAt(0)}
                </div>
                <div className="subject-text">
                  <h5>{s.title}</h5>
                  <p>{s.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =============== CHAT SCREEN =============== //
  return (
    <div className="app-aura-bg">
      <div className="aura-orb orb-1" />
      <div className="aura-orb orb-2" />
      <div className="aura-orb orb-3" />

      <div className="container py-4 d-flex justify-content-center">
        <div className="chat-shell">
          <div className="chat-header d-flex justify-content-between align-items-center mb-3">
            <button
              type="button"
              className="btn btn-sm back-pill"
              onClick={() => {
                setMode(null);
                setMessages([]);
              }}
            >
              ← Back to subjects
            </button>

            <div className="text-end">
              <div className="chat-mode-label">
                {SUBJECTS.find((s) => s.id === mode)?.title}
              </div>
              <div className="chat-mode-sub">
                Powered by Gemini · Study coach
              </div>
            </div>
          </div>

          <div className="chat-main glass-panel mb-3">
            <div className="messages-scroll">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    "msg-row " +
                    (msg.role === "user" ? "msg-row-user" : "msg-row-ai")
                  }
                >
                  <div
                    className={
                      "msg-bubble " +
                      (msg.role === "user" ? "bubble-user" : "bubble-ai")
                    }
                  >
                    <div className="msg-meta">
                      <span className="msg-author">
                        {msg.role === "user" ? "You" : "Tutor"}
                      </span>
                      <span className="msg-time">{msg.timestamp}</span>
                    </div>

                    <div className="msg-text">{msg.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="typing-row">
                  <div className="typing-bubble">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chat-input-row">
            <div className="input-group aura-input-group">
              <textarea
                className="form-control aura-input"
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your tutor anything..."
              />
              <button
                type="button"
                className="btn send-aura-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>

            <button
              type="button"
              className="btn btn-link clear-link mt-2"
              onClick={resetChat}
            >
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
