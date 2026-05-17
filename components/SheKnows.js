"use client";

import { useState, useRef, useEffect } from "react";

const QUESTIONS = [
  {
    id: "name", type: "text", key: "name",
    text: "First, what should I call you? 🌸",
    placeholder: "your name or nickname…",
  },
  {
    id: "age", type: "options", key: "age",
    text: "How old are you?",
    options: [
      { icon: "🌱", label: "Under 18" },
      { icon: "🌸", label: "18–24" },
      { icon: "🌺", label: "25–32" },
      { icon: "🌻", label: "33–40" },
      { icon: "🌷", label: "40+" },
    ],
  },
  {
    id: "cycle", type: "options", key: "cycle",
    text: "How would you describe your cycle?",
    options: [
      { icon: "📅", label: "Regular (21–35 days)" },
      { icon: "⏳", label: "Irregular" },
      { icon: "🚫", label: "Very infrequent or absent" },
      { icon: "😰", label: "Unpredictable & painful" },
      { icon: "🔄", label: "Post-pill / transitioning" },
    ],
  },
  {
    id: "symptoms", type: "multi", key: "symptoms",
    text: "Which symptoms are you currently experiencing?",
    sub: "select everything that applies",
    options: [
      { icon: "🧠", label: "Brain fog" },
      { icon: "💤", label: "Fatigue / exhaustion" },
      { icon: "🌊", label: "Bloating" },
      { icon: "🎭", label: "Mood swings" },
      { icon: "💆", label: "Hair thinning" },
      { icon: "🌟", label: "Acne / skin issues" },
      { icon: "⚖️", label: "Weight changes" },
      { icon: "😴", label: "Sleep problems" },
      { icon: "😣", label: "Painful periods" },
      { icon: "💧", label: "Heavy bleeding" },
      { icon: "😬", label: "Anxiety / low mood" },
      { icon: "🤰", label: "Fertility concerns" },
    ],
  },
  {
    id: "severity", type: "range", key: "severity",
    text: "How much do these symptoms affect your daily life?",
    min: 1, max: 10,
    labels: ["barely noticeable", "very impactful"],
  },
  {
    id: "conditions", type: "multi", key: "conditions",
    text: "Have you been told you have any of the following?",
    sub: "select all that apply — or skip if unsure",
    options: [
      { icon: "🔵", label: "PCOS" },
      { icon: "🟣", label: "Endometriosis" },
      { icon: "🟡", label: "Thyroid condition" },
      { icon: "🟠", label: "Fibroids" },
      { icon: "🩷", label: "PMDD" },
      { icon: "⚪", label: "None / not sure" },
    ],
  },
  {
    id: "tried", type: "multi", key: "tried",
    text: "What have you already tried?",
    sub: "no judgment — helps me tailor my suggestions",
    options: [
      { icon: "💊", label: "Hormonal birth control" },
      { icon: "🥗", label: "Diet changes" },
      { icon: "🏋️", label: "Exercise changes" },
      { icon: "🌿", label: "Supplements" },
      { icon: "🍵", label: "Herbal remedies" },
      { icon: "🙅", label: "Nothing yet" },
    ],
  },
];

const QUICK = [
  "why am I so tired?",
  "help with bloating",
  "brain fog tips",
  "explain my cycle",
  "hormone imbalance signs",
  "why is my skin breaking out?",
];

const C = {
  blush: "#fce8f0",
  rose: "#e8a0c0",
  mauve: "#c47aa3",
  deep: "#8b4a72",
  text: "#5a3050",
  card: "rgba(255,255,255,0.9)",
};

export default function SheKnows() {
  const [screen, setScreen] = useState("welcome");
  const [qIdx, setQIdx] = useState(0);
  const [profile, setProfile] = useState({});
  const [textVal, setTextVal] = useState("");
  const [rangeVal, setRangeVal] = useState(5);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const msgEnd = useRef(null);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const q = QUESTIONS[qIdx];

  function selectSingle(key, val) {
    setProfile((p) => ({ ...p, [key]: val }));
  }

  function toggleMulti(key, val) {
    setProfile((p) => {
      const arr = p[key] ? [...p[key]] : [];
      const i = arr.indexOf(val);
      if (i > -1) arr.splice(i, 1);
      else arr.push(val);
      return { ...p, [key]: arr };
    });
  }

  function canAdvance() {
    if (q.type === "text") return textVal.trim().length > 0;
    if (q.type === "options") return !!profile[q.key];
    return true;
  }

  function advance() {
    let p = { ...profile };
    if (q.type === "text") p[q.key] = textVal.trim();
    if (q.type === "range") p[q.key] = rangeVal;
    setProfile(p);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
      setTextVal("");
      setRangeVal(5);
    } else {
      launchChat(p);
    }
  }

  function goBack() {
    if (qIdx > 0) {
      setQIdx(qIdx - 1);
      setTextVal("");
      setRangeVal(5);
    }
  }

  function launchChat(p) {
    const symList =
      (p.symptoms || []).slice(0, 3).join(", ") || "what you're experiencing";
    const greeting = `Hi ${p.name || "lovely"} 💜 I'm so glad you found your way here.\n\nBased on what you've shared, you're dealing with things like **${symList}** — and I want you to know: what you're feeling is real, it makes sense, and there are reasons behind it.\n\nYou can ask me **anything** — your cycle, hormones, skin, mood, energy, gut health, fertility, or anything else on your mind. This is your space. 🌸`;
    setMessages([{ role: "ai", text: greeting }]);
    setHistory([]);
    setScreen("chat");
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    const newHistory = [...history, { role: "user", content: userMsg }];
    setHistory(newHistory);
    setLoading(true);

    try {
      // Calls our secure Next.js API route — API key never leaves the server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, profile }),
      });
      const data = await res.json();
      const reply =
        data.reply || "I'm here 💜 Could you tell me a little more?";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "I had a little moment 🌸 Could you try again? I'm here.",
        },
      ]);
    }
    setLoading(false);
  }

  function formatMsg(t) {
    const parts = t.split(/(\*\*.*?\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        p.split("\n").map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))
      )
    );
  }

  const GradBtn = ({ label, onClick, disabled = false, fullWidth = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 24px",
        borderRadius: 99,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled
          ? "#ddd"
          : `linear-gradient(135deg, ${C.rose}, ${C.mauve})`,
        color: "white",
        fontFamily: "Georgia, serif",
        fontSize: 15,
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {label}
    </button>
  );

  const BackBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        borderRadius: 99,
        background: "transparent",
        border: `1.5px solid ${C.rose}`,
        color: C.mauve,
        fontFamily: "Georgia, serif",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      ← back
    </button>
  );

  // ── WELCOME ──────────────────────────────
  if (screen === "welcome")
    return (
      <div
        style={{
          background: C.blush,
          minHeight: "100vh",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "32px 20px 16px" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.mauve,
              marginBottom: 6,
              fontFamily: "sans-serif",
            }}
          >
            @She_DeservesToKnow
          </div>
          <h1
            style={{
              fontSize: "clamp(22px,6vw,34px)",
              color: C.deep,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            your women's health{" "}
            <em style={{ color: C.mauve }}>companion</em>
          </h1>
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: C.mauve,
              fontFamily: "sans-serif",
            }}
          >
            by Meesha Goyal · because you deserve to know
          </p>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 60px" }}>
          <div
            style={{
              background: C.card,
              borderRadius: 24,
              border: `1.5px solid rgba(228,160,192,0.4)`,
              padding: "28px 24px",
              boxShadow: "0 8px 32px rgba(139,74,114,0.08)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 32,
                letterSpacing: 8,
                marginBottom: 16,
              }}
            >
              🌸💜🌿
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,5vw,30px)",
                color: C.deep,
                textAlign: "center",
                lineHeight: 1.25,
                marginBottom: 14,
              }}
            >
              your body isn't broken.
              <br />
              <em style={{ color: C.mauve }}>it's asking to be understood.</em>
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: C.mauve,
                lineHeight: 1.75,
                textAlign: "center",
                marginBottom: 20,
                fontFamily: "sans-serif",
              }}
            >
              A safe space to ask about anything — your cycle, hormones, skin,
              mood, energy, gut health, fertility, and everything in between.
              I'll help you understand what might be happening and what could
              help, at home.
            </p>
            <div
              style={{
                background: "rgba(196,122,163,0.1)",
                borderRadius: 12,
                padding: "11px 15px",
                fontSize: 11,
                color: C.mauve,
                marginBottom: 20,
                lineHeight: 1.6,
                borderLeft: `3px solid ${C.rose}`,
                fontFamily: "sans-serif",
              }}
            >
              ⚠️ For informational support only — not a diagnosis or substitute
              for medical care. Always speak to a healthcare provider about your
              symptoms.
            </div>
            <GradBtn
              label="let's get to know you →"
              onClick={() => setScreen("questionnaire")}
              fullWidth
            />
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: C.rose,
              marginTop: 14,
              fontFamily: "sans-serif",
            }}
          >
            takes about 2 minutes · completely private
          </p>
        </div>
      </div>
    );

  // ── QUESTIONNAIRE ─────────────────────────
  if (screen === "questionnaire") {
    const pct = (qIdx / QUESTIONS.length) * 100;
    return (
      <div
        style={{
          background: C.blush,
          minHeight: "100vh",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "24px 20px 10px" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.mauve,
              fontFamily: "sans-serif",
            }}
          >
            @She_DeservesToKnow
          </div>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 60px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 6,
                background: "rgba(196,122,163,0.2)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: pct + "%",
                  background: `linear-gradient(90deg, ${C.rose}, ${C.mauve})`,
                  borderRadius: 99,
                  transition: "width 0.5s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: C.mauve,
                fontFamily: "sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {qIdx + 1} of {QUESTIONS.length}
            </span>
          </div>

          <div
            style={{
              background: C.card,
              borderRadius: 24,
              border: `1.5px solid rgba(228,160,192,0.4)`,
              padding: "26px 22px",
              boxShadow: "0 8px 32px rgba(139,74,114,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.rose,
                marginBottom: 5,
                fontFamily: "sans-serif",
              }}
            >
              question {qIdx + 1}
            </div>
            <div
              style={{
                fontSize: "clamp(16px,4vw,21px)",
                color: C.deep,
                lineHeight: 1.35,
                marginBottom: 18,
              }}
            >
              {q.text}
            </div>
            {q.sub && (
              <div
                style={{
                  fontSize: 12,
                  color: C.mauve,
                  marginTop: -12,
                  marginBottom: 16,
                  fontStyle: "italic",
                  fontFamily: "sans-serif",
                }}
              >
                {q.sub}
              </div>
            )}

            {q.type === "text" && (
              <textarea
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder={q.placeholder}
                rows={2}
                style={{
                  width: "100%",
                  border: `1.5px solid rgba(196,122,163,0.3)`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontFamily: "sans-serif",
                  fontSize: 14,
                  color: C.text,
                  background: "rgba(255,255,255,0.7)",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}

            {(q.type === "options" || q.type === "multi") && (
              <div
                style={{
                  display: "grid",
                  gap: 9,
                  gridTemplateColumns:
                    q.options.length <= 3 ? "1fr" : "1fr 1fr",
                }}
              >
                {q.options.map((opt) => {
                  const sel =
                    q.type === "options"
                      ? profile[q.key] === opt.label
                      : (profile[q.key] || []).includes(opt.label);
                  const toggle =
                    q.type === "options"
                      ? () => selectSingle(q.key, opt.label)
                      : () => toggleMulti(q.key, opt.label);
                  return (
                    <button
                      key={opt.label}
                      onClick={toggle}
                      style={{
                        background: sel
                          ? `linear-gradient(135deg,rgba(228,160,192,0.4),rgba(196,122,163,0.25))`
                          : "rgba(255,255,255,0.65)",
                        border: `1.5px solid ${
                          sel ? C.mauve : "rgba(196,122,163,0.28)"
                        }`,
                        borderRadius: 14,
                        padding: "11px 13px",
                        fontFamily: "sans-serif",
                        fontSize: 13,
                        color: sel ? C.deep : C.text,
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: sel ? 600 : 400,
                      }}
                    >
                      <span
                        style={{ display: "block", fontSize: 17, marginBottom: 3 }}
                      >
                        {opt.icon}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "range" && (
              <div style={{ padding: "8px 0" }}>
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  value={rangeVal}
                  onChange={(e) => setRangeVal(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: C.mauve, cursor: "pointer" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: C.mauve,
                    marginTop: 6,
                    fontFamily: "sans-serif",
                  }}
                >
                  <span>{q.labels[0]}</span>
                  <span>{q.labels[1]}</span>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                    fontSize: 30,
                    color: C.deep,
                    fontWeight: 700,
                  }}
                >
                  {rangeVal}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                justifyContent: "flex-end",
              }}
            >
              {qIdx > 0 && <BackBtn onClick={goBack} />}
              <GradBtn
                label={
                  qIdx < QUESTIONS.length - 1
                    ? "continue →"
                    : "meet your companion 🌸"
                }
                onClick={advance}
                disabled={!canAdvance()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CHAT ──────────────────────────────────
  const syms = (profile.symptoms || []).join(", ") || "none shared";
  const conds = (profile.conditions || []).join(", ") || "none/unsure";
  const tried = (profile.tried || []).join(", ") || "nothing yet";

  return (
    <div
      style={{
        background: C.blush,
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "20px 20px 10px" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: C.mauve,
            fontFamily: "sans-serif",
          }}
        >
          @She_DeservesToKnow
        </div>
        <h1
          style={{
            fontSize: "clamp(18px,4vw,26px)",
            color: C.deep,
            margin: "4px 0 0",
          }}
        >
          your women's health <em style={{ color: C.mauve }}>companion</em>
        </h1>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 14px 60px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 18px",
            marginBottom: 10,
            background: C.card,
            borderRadius: 20,
            border: `1.5px solid rgba(228,160,192,0.4)`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.rose},${C.mauve})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🌸
          </div>
          <div>
            <div style={{ fontSize: 15, color: C.deep }}>She Knows</div>
            <div
              style={{ fontSize: 11, color: C.mauve, fontFamily: "sans-serif" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  background: "#a8d8a0",
                  borderRadius: "50%",
                  marginRight: 4,
                }}
              />
              here for you
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(228,160,192,0.15)",
            borderRadius: 14,
            padding: "10px 14px",
            marginBottom: 10,
            border: `1px solid rgba(196,122,163,0.2)`,
            fontSize: 11.5,
            color: C.mauve,
            lineHeight: 1.8,
            fontFamily: "sans-serif",
          }}
        >
          <strong style={{ color: C.deep }}>{profile.name || "you"}</strong> ·{" "}
          {profile.age || "—"} · cycle: {profile.cycle || "—"} · severity{" "}
          {profile.severity || "?"}/10
          <br />
          <strong style={{ color: C.deep }}>symptoms:</strong> {syms}
          <br />
          <strong style={{ color: C.deep }}>conditions:</strong> {conds} ·{" "}
          <strong style={{ color: C.deep }}>tried:</strong> {tried}
        </div>

        <div
          style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}
        >
          {QUICK.map((qk) => (
            <button
              key={qk}
              onClick={() => send(qk)}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.7)",
                border: `1px solid rgba(196,122,163,0.3)`,
                fontSize: 11.5,
                color: C.mauve,
                cursor: "pointer",
                fontFamily: "sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {qk}
            </button>
          ))}
        </div>

        <div
          style={{
            background: C.card,
            borderRadius: 22,
            border: `1.5px solid rgba(228,160,192,0.4)`,
            padding: "14px 14px 12px",
            boxShadow: "0 6px 24px rgba(139,74,114,0.07)",
          }}
        >
          <div
            style={{
              maxHeight: 420,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingRight: 4,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "11px 15px",
                    borderRadius: 18,
                    borderBottomLeftRadius: m.role === "ai" ? 4 : 18,
                    borderBottomRightRadius: m.role === "user" ? 4 : 18,
                    background:
                      m.role === "user"
                        ? `linear-gradient(135deg,${C.rose},${C.mauve})`
                        : "white",
                    color: m.role === "user" ? "white" : C.text,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    fontFamily: "sans-serif",
                    boxShadow:
                      m.role === "ai"
                        ? "0 2px 10px rgba(139,74,114,0.07)"
                        : "none",
                  }}
                >
                  {formatMsg(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    borderBottomLeftRadius: 4,
                    padding: "12px 16px",
                    boxShadow: "0 2px 10px rgba(139,74,114,0.07)",
                  }}
                >
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: C.rose,
                          animation: "bounce 1.2s infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEnd} />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              background: "rgba(252,232,240,0.6)",
              borderRadius: 16,
              padding: "8px 8px 8px 14px",
              border: `1.5px solid rgba(196,122,163,0.25)`,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="ask me anything about your health…"
              rows={1}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontFamily: "sans-serif",
                fontSize: 14,
                color: C.text,
                outline: "none",
                resize: "none",
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${C.rose},${C.mauve})`,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                alignSelf: "flex-end",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="white">
                <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: C.rose,
            marginTop: 14,
            fontFamily: "sans-serif",
          }}
        >
          💜 informational support only — not medical advice
        </p>
        <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
      </div>
    </div>
  );
}
