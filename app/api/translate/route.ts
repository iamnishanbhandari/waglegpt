import { NextResponse } from "next/server";
import { demoExamples } from "@/lib/content";

export const runtime = "nodejs";

const rates = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const current = rates.get(ip);
  if (!current || current.reset < now) {
    rates.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  if (!rateLimit(request.headers.get("x-forwarded-for") ?? "local")) {
    return NextResponse.json({ error: "धेरै request भयो। एक मिनेटपछि प्रयास गर्नुहोस्।" }, { status: 429 });
  }

  let body: { mode?: string; text?: string; complexity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Input मिलेन।" }, { status: 400 });
  }

  const { mode, text = "", complexity = 1 } = body;
  if (!["simplify", "parody"].includes(mode ?? "")) {
    return NextResponse.json({ error: "Mode मान्य छैन।" }, { status: 400 });
  }
  if (text.length > 800) {
    return NextResponse.json({ error: "पाठ 800 character भन्दा छोटो राख्नुहोस्।" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ error: "पहिले केही लेख्नुहोस्।" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const examples = mode === "simplify" ? demoExamples.simplify : demoExamples.parody;
    const fallback = examples.find((example) => example.input.toLowerCase() === text.trim().toLowerCase()) ?? examples[Math.abs(text.length) % examples.length];
    const translation = mode === "parody" && complexity > 1
      ? `${fallback.output.replace(/\.$/, "")}, consequently requiring an appropriately circumspect vocabulary-based intervention.`
      : fallback.output;
    return NextResponse.json({
      mode,
      original: text.trim(),
      translation,
      shortExplanation: "Demo mode: predefined sample generated locally.",
      isVerifiedQuote: false,
      sourceUrl: null,
      demo: true,
    });
  }

  const system = mode === "simplify"
    ? "Explain the text in short, natural Nepali. Preserve meaning and uncertainty. Explain uncommon English words. Never invent policy consequences or opinions. Output JSON with translation and shortExplanation."
    : `Transform everyday Nepali or English into humorous, pompous, academically sophisticated but meaningful English-heavy language. Meaning level ${complexity}. Avoid repetitive templates, accusations, fabricated politics, and claiming the result is a real quotation. Output JSON with translation and shortExplanation.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: text.trim() },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const payload = await response.json();
    const parsed = JSON.parse(payload.choices[0].message.content);
    return NextResponse.json({
      mode,
      original: text.trim(),
      translation: parsed.translation ?? "",
      shortExplanation: parsed.shortExplanation ?? "",
      isVerifiedQuote: false,
      sourceUrl: null,
      demo: false,
    });
  } catch {
    return NextResponse.json({ error: "AI सेवा अहिले उपलब्ध छैन। Demo mode प्रयोग गर्न API key हटाउनुहोस्।" }, { status: 502 });
  }
}
