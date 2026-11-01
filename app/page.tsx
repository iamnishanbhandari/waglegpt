"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Download, RefreshCw, Share2, Sparkles } from "lucide-react";
import { demoExamples, vocabulary } from "@/lib/content";

type Mode = "simplify" | "parody";
type Result = {
  translation: string;
  shortExplanation?: string;
  demo?: boolean;
  isVerifiedQuote?: boolean;
};

const loadingMessages = [
  "Oxford Dictionary consult हुँदैछ...",
  "सामान्य शब्दहरू हटाइँदैछ...",
  "Vocabulary को GDP बढ्दैछ...",
  "Shashi Tharoor सँग consultation हुँदैछ...",
  "Intellectual capacity loading...",
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("parody");
  const [text, setText] = useState("");
  const [complexity, setComplexity] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  async function translate(extraComplexity = 0) {
    if (!text.trim()) {
      setError("पहिले केही sentence लेख्नुहोस्।");
      return;
    }
    setLoading(true);
    setError("");
    const level = Math.min(3, complexity + extraComplexity);
    const timer = window.setInterval(() => setLoadingIndex((value) => (value + 1) % loadingMessages.length), 900);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text, complexity: level }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Translation failed.");
      setResult(data);
      setComplexity(level);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      window.clearInterval(timer);
      setLoading(false);
    }
  }

  function randomExample() {
    const examples = mode === "simplify" ? demoExamples.simplify : demoExamples.parody;
    const example = examples[Math.floor(Math.random() * examples.length)];
    setText(example.input);
    setResult(null);
    setError("");
  }

  async function copyText() {
    if (!result) return;
    await navigator.clipboard.writeText(result.translation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function exportCard(format: "square" | "story") {
    if (!result) return;
    const width = 1080;
    const height = format === "square" ? 1080 : 1920;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f1e6c9";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#28241f";
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.fillStyle = "#28241f";
    ctx.textAlign = "center";
    ctx.font = '700 92px Georgia, "Noto Sans Devanagari", serif';
    ctx.fillText("WagleGPT", width / 2, 150);
    ctx.font = '700 28px Georgia';
    ctx.fillStyle = "#a72d32";
    ctx.fillText("UNOFFICIAL PARODY · अनाधिकारिक व्यङ्ग्य", width / 2, 195);

    ctx.fillStyle = "#fffaf0";
    ctx.strokeStyle = "#28241f";
    ctx.lineWidth = 5;
    roundRect(ctx, 70, height * 0.23, width - 140, height * 0.23, 28);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#28241f";
    ctx.textAlign = "left";
    ctx.font = `700 ${height === 1080 ? 38 : 46}px "Noto Sans Devanagari", sans-serif`;
    wrapText(ctx, text, 120, height * 0.28, width - 240, height === 1080 ? 53 : 62);

    ctx.textAlign = "center";
    ctx.fillStyle = "#a72d32";
    ctx.font = '700 24px Georgia';
    ctx.fillText("SIMPLE MEANING / सजिलो अर्थ", width / 2, height * 0.55);
    ctx.fillStyle = "#28241f";
    ctx.font = `700 ${height === 1080 ? 40 : 48}px "Noto Sans Devanagari", sans-serif`;
    wrapText(ctx, result.translation, 120, height * 0.59, width - 240, height === 1080 ? 56 : 68);

    ctx.font = "700 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WagleGPT — Unofficial Satire", width / 2, height - 70);
    const link = document.createElement("a");
    link.download = `waglegpt-${format}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function shareCard() {
    if (!result) return;
    const textToShare = `${text}\n\n→ ${result.translation}\n\n#WagleGPT`;
    if (navigator.share) {
      await navigator.share({ title: "WagleGPT", text: textToShare });
    } else {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setResult(null);
    setError("");
    setText("");
  }

  return (
    <main>
      <header className="masthead">
        <a href="#" className="brand">WagleGPT<span>अ</span></a>
        <nav><a href="#dictionary">शब्दकोश</a><span className="parody-tag">Unofficial parody</span></nav>
      </header>

      <section className="hero">
        <div className="hero-art">
          <div className="floating-word word-one">Grand Larceny!</div>
          <div className="floating-word word-two">Schadenfreude!</div>
          <img className="cartoon-photo" src="/wagle-reference.webp" alt="Newspaper-cartoon portrait of Swarnim Wagle based on the supplied reference" />
        </div>
        <div className="hero-copy">
          <p className="kicker">आधा अर्थशास्त्र, आधा शब्दकोष</p>
          <h1>WagleGPT</h1>
          <p className="tagline">जटिल कुरा सजिलै बुझौं। सामान्य कुरा जटिल बनाऔं।</p>
          <p className="subline">Oxford Dictionary पनि कहिलेकाहीँ हार खान्छ।</p>
        </div>
      </section>

      <section className="translator" aria-labelledby="translator-title">
        <div className="section-label">आजको अखबार — अनुवाद पाना</div>
        <div className="mode-tabs" role="tablist">
          <button className={mode === "simplify" ? "active" : ""} onClick={() => switchMode("simplify")} role="tab">A · Wagle → Nepali</button>
          <button className={mode === "parody" ? "active" : ""} onClick={() => switchMode("parody")} role="tab">B · Nepali → Wagle</button>
        </div>

        <div className="comic-grid">
          <div className={`character-panel ${loading ? "thinking" : ""}`}>
            <img className="cartoon-photo" src="/wagle-reference.webp" alt="" />
            <AnimatePresence>
              {loading && (
                <motion.div className="loading-bubble" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  {loadingMessages[loadingIndex]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="input-panel">
            <label htmlFor="source">{mode === "simplify" ? "जटिल English लेख्नुहोस्" : "साधारण Nepali लेख्नुहोस्"}</label>
            <textarea
              id="source"
              value={text}
              maxLength={800}
              onChange={(event) => setText(event.target.value)}
              placeholder={mode === "simplify" ? "We must address structural impediments..." : "मसँग पैसा छैन।"}
            />
            <div className="input-meta"><button type="button" onClick={randomExample}>कुनै उदाहरण देखाऊ</button><span>{text.length}/800</span></div>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="generate" onClick={() => translate()} disabled={loading}>
              <Sparkles size={18} /> {loading ? "शब्दकोष मिलाउँदै..." : mode === "simplify" ? "सजिलो बनाऊ" : "Wagle बनाऊ"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div className="result-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <div className="result-stamp">{mode === "simplify" ? "सजिलो अर्थ" : "विग्लाइन्ड संस्करण"}</div>
              <p>{result.translation}</p>
              {result.shortExplanation && <small>{result.shortExplanation}</small>}
              {result.demo && <small className="demo-note">DEMO MODE · पूर्वनिर्धारित नमुना</small>}
              <div className="result-actions">
                <button onClick={copyText}><Copy size={17} />{copied ? "Copy भयो!" : "Copy"}</button>
                <button onClick={() => translate()}><RefreshCw size={17} />फेरि बनाऊ</button>
                {mode === "parody" && complexity < 3 && <button onClick={() => translate(1)}><Sparkles size={17} />अझै जटिल बनाऊ</button>}
                <button onClick={shareCard}><Share2 size={17} />Share</button>
              </div>
              <div className="export-actions">
                <button onClick={() => exportCard("square")}><Download size={17} />1080×1080 PNG</button>
                <button onClick={() => exportCard("story")}><Download size={17} />1080×1920 Story</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="dictionary" id="dictionary">
        <div>
          <p className="kicker">धेरै अर्थ, अझै बढी हास्य</p>
          <h2>स्वर्णिम शब्दकोश</h2>
          <p>प्रमाणित सार्वजनिक बातचीतका शब्दहरू। Attribution स्पष्ट गरिएको छ।</p>
        </div>
        <div className="word-grid">
          {vocabulary.map((entry, index) => (
            <article className="word-card" key={entry.word}>
              <div className="word-index">{String(index + 1).padStart(2, "0")}</div>
              <h3>{entry.word}</h3>
              <p className="nepali">{entry.nepali}</p>
              <p>{entry.meaning}</p>
              <blockquote>{entry.example}</blockquote>
              <small>{entry.attribution}</small>
              {entry.sourceUrl && <a href={entry.sourceUrl} target="_blank" rel="noreferrer">मूल स्रोत हेर्नुहोस् <ArrowRight size={14} /></a>}
            </article>
          ))}
        </div>
      </section>

      <footer>
        <strong>WagleGPT — Unofficial Satire</strong>
        <p>यो हास्यात्मक parody हो। यहाँ कुनै statement लाई वास्तविक उद्धरण मान्नुपर्दैन।</p>
      </footer>
    </main>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  let row = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, row);
      line = word;
      row += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, row);
}
