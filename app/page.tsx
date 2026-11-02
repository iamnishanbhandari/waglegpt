"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, Check, Copy, Download, ExternalLink, LoaderCircle, RefreshCw, Share2, Shuffle, Sparkles, X } from "lucide-react";
import { demoExamples, vocabulary, documentVocabulary, type Mode, type Translation } from "@/lib/content";
import { canvasBlob, renderShareCard, type CardFormat } from "@/lib/share-card";

const loadingMessages = ["Oxford Dictionary consult हुँदैछ…", "सामान्य शब्दहरू हटाइँदैछ…", "Vocabulary को GDP बढ्दैछ…", "Shashi Tharoor सँग consultation हुँदैछ…", "Intellectual capacity loading…"];

export default function Home() {
  const [mode, setMode] = useState<Mode>("parody");
  const [text, setText] = useState("");
  const [complexity, setComplexity] = useState(1);
  const [variant, setVariant] = useState(0);
  const [result, setResult] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [format, setFormat] = useState<CardFormat>("square");
  const [shareOpen, setShareOpen] = useState(false);
  const [cardUrl, setCardUrl] = useState("");
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [exportError, setExportError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch("/api/translate").then(r => r.json()).then(data => setDemo(data.demo)).catch(() => {}); }, []);
  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => setLoadingIndex(i => (i + 1) % loadingMessages.length), 1100);
    return () => window.clearInterval(timer);
  }, [loading]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (shareOpen) dialog.current?.showModal(); else dialog.current?.close();
  }, [shareOpen]);
  useEffect(() => {
    if (!shareOpen || !result) return;
    let cancelled = false;
    let url = "";
    setCardUrl(""); setCardBlob(null); setExportError("");
    renderShareCard(result, format).then(canvasBlob).then(blob => {
      if (cancelled) return;
      url = URL.createObjectURL(blob); setCardUrl(url); setCardBlob(blob);
    }).catch(err => { if (!cancelled) setExportError(err instanceof Error ? err.message : "चित्र बनाउन सकिएन।"); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [shareOpen, result, format]);

  async function translate(extra = 0, regenerate = false) {
    if (loading) return;
    if (!text.trim()) { setError("पहिले केही लेख्नुहोस्, वा एउटा उदाहरण छान्नुहोस्।"); textarea.current?.focus(); return; }
    setLoading(true); setError("");
    const level = Math.min(3, complexity + extra);
    const nextVariant = regenerate ? variant + 1 : variant;
    try {
      const response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, text, complexity: level, variant: nextVariant }), signal: AbortSignal.timeout(40_000) });
      const data = await response.json();
      if (typeof data.demo === "boolean") setDemo(data.demo);
      if (!response.ok) throw new Error(data.error || "अनुवाद हुन सकेन। फेरि प्रयास गर्नुहोस्।");
      setResult(data); setComplexity(level); setVariant(nextVariant);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" }), 100);
    } catch (err) { setError(err instanceof Error && err.name !== "TimeoutError" ? err.message : "समय धेरै लाग्यो। फेरि प्रयास गर्नुहोस्।"); }
    finally { setLoading(false); }
  }
  function setInput(value: string) { setText(value); setResult(null); setComplexity(1); setVariant(0); setError(""); }
  function switchMode(next: Mode) { if (loading || next === mode) return; setMode(next); setInput(""); }
  function randomExample() {
    const examples = demoExamples[mode];
    const options = examples.filter(example => example.input !== text);
    setInput(options[Math.floor(Math.random() * options.length)].input);
    textarea.current?.focus();
  }
  function tabKey(event: KeyboardEvent, current: Mode) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "simplify" : event.key === "End" ? "parody" : current === "parody" ? "simplify" : "parody";
    switchMode(next); document.getElementById(`tab-${next}`)?.focus();
  }
  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.translation); setNotice("Copy भयो! साथीलाई पठाउनुहोस्।"); }
    catch { setError("Copy भएन। अनुवाद छानेर copy गर्नुहोस्।"); }
  }
  async function nativeShare() {
    if (!result || !cardBlob) return;
    const file = new File([cardBlob], `waglegpt-${format}.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: "WagleGPT — Unofficial Satire", files: [file] });
      else if (navigator.share) await navigator.share({ title: "WagleGPT — Unofficial Satire", text: `${result.original}\n→ ${result.translation}\nकाल्पनिक व्यङ्ग्य · #WagleGPT` });
      else { await navigator.clipboard.writeText(`${result.original}\n→ ${result.translation}\nकाल्पनिक व्यङ्ग्य · #WagleGPT`); setNotice("Share text copy भयो। PNG पनि download गर्न सक्नुहुन्छ।"); }
    } catch (err) { if (!(err instanceof Error && err.name === "AbortError")) setExportError("Share हुन सकेन। PNG download गरेर पठाउनुहोस्।"); }
  }

  return <MotionConfig reducedMotion="user"><main className="newspaper">
    <header className="masthead">
      <a className="brand" href="#" aria-label="WagleGPT home">Wagle<span>GPT</span><span className="brand-dot">.</span></a>
      <div className="masthead-caption">THE UNOFFICIAL VOCABULARY DEPARTMENT<br /><span>शब्द ठूला। कुरा साना।</span></div>
      <nav aria-label="Main navigation"><a href="#dictionary">शब्दकोश</a><a href="#about">हाम्रो बारे <ArrowRight size={14} /></a></nav>
    </header>
    <div className="edition-line"><span>नेपाली हास्य संस्करण · VOL. 01</span><span className="edition-center">स्वतन्त्र व्यङ्ग्य। कुनै आधिकारिक सम्बन्ध छैन।</span><span>मूल्य: एक मुस्कान</span></div>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span /> THE ART OF SAYING TOO MUCH</p>
        <h1 id="hero-title">कुरा उही।<br /><span>शब्द अलि</span><br />ठूला।<span className="headline-star" aria-hidden="true">✳</span></h1>
        <p className="tagline">जटिल कुरा सजिलै बुझौं।<br />सामान्य कुरा जटिल बनाऔं।</p>
        <div className="hero-bottom"><a href="#translator" className="ink-link">ल, सुरु गरौं <ArrowDown size={17} /></a><span>Oxford Dictionary पनि<br />कहिलेकाहीँ हार खान्छ।</span></div>
      </div>
      <div className="hero-art">
        <div className="hero-speech"><span>“An acute pecuniary<br />predicament!”</span><small>अर्थात्… पैसा छैन।</small></div>
        <Image width={1338} height={1176} sizes="(max-width: 600px) 90vw, 560px" priority className="hero-portrait" src="/wagle-editorial.png" alt="स्वर्णिम वाग्लेबाट प्रेरित काल्पनिक कार्टुन: ठूलो शब्दकोश लिएर मुस्कुराउँदै।" />
        <span className="art-note">AN AFFECTIONATE CARICATURE<br />NOT AN OFFICIAL PORTRAIT</span>
        <span className="floating-word">Grand larceny!</span>
        <div className="parody-stamp">१००%<br /><b>व्यङ्ग्य</b></div>
      </div>
    </section>
    <div className="ticker" aria-hidden="true"><span>साना कुराको ठूलो अनुवाद</span><i>✳</i><span>NO LOGIN. JUST LANGUAGE.</span><i>✳</i><span>बुझ्ने हो कि बुझाउनै नसकिने बनाउने?</span><i>✳</i><span>MADE FOR A GOOD LAUGH</span></div>

    <section className="translator" id="translator" aria-labelledby="translator-title">
      <div className="section-heading"><div><p className="eyebrow">01 / THE TRANSLATION DESK</p><h2 id="translator-title">तपाईंको कुरा, <span>अर्कै अवतार।</span></h2></div><p>तपाईंले बोलेको कुरा Oxford ले पनि<br />नबुझ्ने बनाइदिन्छौं।</p></div>
      <div className="translation-sheet">
        <div className="mode-tabs" role="tablist" aria-label="Translation mode">
          {(["simplify", "parody"] as const).map(tab => <button key={tab} id={`tab-${tab}`} role="tab" aria-selected={mode === tab} aria-controls="translation-panel" tabIndex={mode === tab ? 0 : -1} className={mode === tab ? "active" : ""} disabled={loading} onClick={() => switchMode(tab)} onKeyDown={event => tabKey(event, tab)}><span className="tab-number">{tab === "simplify" ? "A" : "B"}</span><span>{tab === "simplify" ? "Wagle → Nepali" : "Nepali → Wagle"}<small>{tab === "simplify" ? "ठूलो शब्द, सानो अर्थ" : "सानो कुरा, ठूलो शब्द"}</small></span>{mode === tab && <Check size={20} />}</button>)}
        </div>
        <div className="translation-workspace" id="translation-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} aria-busy={loading}>
          <div className="input-panel">
            <div className="field-heading"><label htmlFor="source">{mode === "parody" ? "साधारण कुरा लेख्नुहोस्" : "जटिल कुरा यहाँ राख्नुहोस्"}</label><span>{text.length} / 800</span></div>
            <textarea ref={textarea} id="source" value={text} disabled={loading} maxLength={800} onChange={event => setInput(event.target.value)} placeholder={mode === "parody" ? "मलाई चिया पिउन मन लाग्यो।" : "We must address structural impediments to economic growth."} aria-describedby="input-help" onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); void translate(); } }} />
            <div className="input-tools"><button disabled={loading} onClick={randomExample}><Shuffle size={15} />एउटा उदाहरण</button><span id="input-help">नेपाली, English, वा दुवै</span></div>
            <div className="example-chips" aria-label="Try a demo example">{demoExamples[mode].slice(0, mode === "parody" ? 3 : 2).map(example => <button disabled={loading} key={example.input} onClick={() => setInput(example.input)}>{example.input.length > 65 ? "अर्थतन्त्रको कुरा" : example.input}</button>)}</div>
            <button className="generate" disabled={loading} onClick={() => translate()}>{loading ? <LoaderCircle size={19} className="spin" /> : <Sparkles size={19} />}<span>{loading ? "शब्दकोश पल्टाउँदै…" : mode === "parody" ? "Wagle बनाऊ" : "सजिलो बनाऊ"}</span><ArrowRight size={20} /></button>
            {demo !== null && <p className="demo-note"><span className={demo ? "status-dot" : "status-dot live"} />{demo ? "DEMO EDITION · तयार उदाहरण छानेर चलाउनुहोस्" : "AI EDITION · आफ्नै वाक्य लेख्नुहोस्"}</p>}
            {error && <p className="error" role="alert">{error}</p>}
          </div>
          <div className={`desk-illustration ${loading ? "thinking" : ""}`} aria-hidden="true"><div className="desk-bubble">{loading ? loadingMessages[loadingIndex] : mode === "parody" ? <>“Why say ‘भोक लाग्यो’<br />when you can say<br /><em>gastronomical exigency?</em>”</> : <>“ए, भन्न खोजेको<br /><em>यति मात्रै रहेछ!</em>”</>}</div><Image src="/wagle-editorial.png" width={1338} height={1176} sizes="(max-width: 600px) 180px, 380px" alt="" /><span className="desk-caption">{mode === "parody" ? "DICTIONARY: OPEN FOR BUSINESS" : "DICTIONARY: TAKING A BREAK"}</span></div>
        </div>
        <AnimatePresence>{result && <motion.div ref={resultRef} className="result-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} role="status" aria-live="polite"><div className="result-label"><span>{result.mode === "parody" ? "THE GRAND TRANSLATION" : "THE SIMPLE TRUTH"}</span><small>{result.demo ? "CURATED DEMO" : "AI GENERATED"} · काल्पनिक व्यङ्ग्य</small></div><p className="result-text">{result.translation}</p>{result.shortExplanation && <p className="result-explanation">{result.mode === "parody" ? "भन्न खोजेको: " : ""}{result.shortExplanation}</p>}<div className="result-actions"><button onClick={copy}><Copy size={16} />Copy</button><button disabled={loading} onClick={() => translate(0, true)}><RefreshCw size={16} />फेरि बनाऊ</button>{mode === "parody" && complexity < 3 && <button disabled={loading} onClick={() => translate(1)}><Sparkles size={16} />अझै जटिल बनाऊ</button>}<button className="share-button" onClick={() => setShareOpen(true)}><Share2 size={16} />कार्टुन बनाएर पठाऊ</button></div><p className="fiction-note">यो बनाइएको वाक्य हो, स्वर्णिम वाग्लेको वास्तविक उद्धरण होइन।</p></motion.div>}</AnimatePresence>
      </div>
      <p className="under-desk"><BookOpen size={14} /> शब्दमा अलिकति नाटक। अर्थमा कुनै सम्झौता छैन।</p>
    </section>

    <section className="dictionary" id="dictionary" aria-labelledby="dictionary-title"><div className="section-heading"><div><p className="eyebrow">02 / WORDS FROM THE PUBLIC RECORD</p><h2 id="dictionary-title">स्वर्णिम <span>शब्दकोश।</span></h2></div><p>शब्दको अर्थ सजिलो छ।<br />उच्चारण तपाईंको जिम्मा!</p></div><p className="source-note">यी चार शब्दको प्रयोग र वक्ताको विवरण NDTV को रिपोर्टमा आधारित छ। मूल भिडियोको transcript उपलब्ध नभएकाले प्रत्यक्ष उद्धरणको दाबी गरिएको छैन। हँसिला उदाहरणहरू हाम्रा हुन्।</p><div className="word-grid">{vocabulary.map((entry, index) => <article className="word-card" key={entry.word}><div className="word-card-top"><span>WORD NO. {String(index + 1).padStart(2, "0")}</span><BookOpen size={19} strokeWidth={1.4} /></div><h3>{entry.word}</h3><p className="word-meaning">{entry.nepali}</p><p className="word-example">{entry.example}</p><div className="word-source"><small>{entry.attribution}</small><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceLabel}<ExternalLink size={12} /></a></div></article>)}</div><button className="more-words" aria-expanded={showMore} aria-controls="budget-words" onClick={() => setShowMore(value => !value)}>{showMore ? "बजेटका शब्द लुकाऊ" : "बजेटका थप १० शब्द हेर्नुहोस्"}<ArrowDown size={16} style={{ transform: showMore ? "rotate(180deg)" : undefined }} /></button>{showMore && <div id="budget-words"><p className="source-note">Ministry of Finance मा प्रकाशित 2026/27 बजेटको अंग्रेजी संस्करणबाट जाँचिएका शब्दहरू। PDF आफैंले “Unofficial Translation” भनेको छ। यी बोलिएका अंग्रेजी उद्धरण होइनन्। Page भनेको PDF को page number हो।</p><div className="budget-grid">{documentVocabulary.map(entry => <article className="budget-word" key={entry.word}><h3>{entry.word}</h3><p>{entry.nepali}</p><blockquote>{entry.example}</blockquote><small>{entry.attribution}</small><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceLabel}<ExternalLink size={12} /></a></article>)}</div></div>}</section>

    <section className="about" id="about"><span className="about-mark" aria-hidden="true">अ</span><div><p className="eyebrow">A LITTLE CONTEXT, WITHOUT THE BIG WORDS</p><h2>व्यङ्ग्य हो। <span>व्यक्तिगत होइन।</span></h2><p>WagleGPT शब्द र शैलीसँग खेल्ने अनौपचारिक हास्य प्रयोग हो। यो स्वर्णिम वाग्लेद्वारा बनाइएको, सञ्चालित वा समर्थित वेबसाइट होइन। हाँसो ठूलो शब्दको हो, व्यक्तिको होइन। AI ले पनि गल्ती गर्न सक्छ; अर्थ एकपटक जाँच्नुहोस्।</p><a href="/research.md" target="_blank" rel="noreferrer">स्रोत र अनुसन्धान नोटहरू <ArrowRight size={15} /></a></div></section>
    <footer><a className="brand" href="#">Wagle<span>GPT</span><span className="brand-dot">.</span></a><p>बुझ्न सजिलो। हाँस्न झन् सजिलो।</p><small>UNOFFICIAL SATIRE · MADE WITH A NEPALI SENSE OF HUMOUR</small></footer>
    <div className="toast" role="status" aria-live="polite">{notice && <span><Check size={16} />{notice}</span>}</div>

    <dialog ref={dialog} className="share-dialog" onCancel={() => setShareOpen(false)} onClose={() => setShareOpen(false)} onClick={event => { if (event.target === dialog.current) setShareOpen(false); }} aria-labelledby="share-title"><div className="dialog-heading"><div><p className="eyebrow">THE SHAREABLE EDITION</p><h2 id="share-title">यो त पठाउनै पर्छ!</h2></div><button className="close-button" onClick={() => setShareOpen(false)} aria-label="Close share preview"><X size={23} /></button></div><div className="format-tabs" aria-label="Image format"><button aria-pressed={format === "square"} onClick={() => setFormat("square")}>पोस्ट · 1080 × 1080</button><button aria-pressed={format === "story"} onClick={() => setFormat("story")}>स्टोरी · 1080 × 1920</button></div><div className="card-preview" aria-busy={!cardUrl && !exportError}>{cardUrl ? <img src={cardUrl} alt="काल्पनिक कार्टुन preview: जटिल वाक्य र त्यसको सजिलो नेपाली अर्थ।" /> : exportError ? <p role="alert">{exportError}</p> : <LoaderCircle className="spin" aria-label="Preparing image" />}</div>{exportError && cardUrl && <p className="error" role="alert">{exportError}</p>}<div className="dialog-actions"><a className={`download-button ${!cardUrl ? "disabled" : ""}`} href={cardUrl || undefined} download={`waglegpt-${format}.png`} aria-disabled={!cardUrl}><Download size={17} />PNG डाउनलोड</a><button disabled={!cardBlob} onClick={nativeShare}><Share2 size={17} />साथीलाई पठाऊ</button></div><p className="fiction-note">काल्पनिक व्यङ्ग्य · वास्तविक उद्धरण होइन</p></dialog>
  </main></MotionConfig>;
}
