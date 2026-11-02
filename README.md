# WagleGPT

A functional, mobile-first Nepali vocabulary parody app, built with Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion and Lucide. It is **not affiliated with, endorsed by, or operated by Swarnim Wagle**.

## Run

Node.js 20.9+ is required.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. No account, database, or API key is required for the curated demo. Choose a suggested sentence or a random example, then generate. Unknown demo input produces a clear explanation instead of an unrelated fake translation.

## Live AI

In `.env.local` or Vercel environment settings:

```dotenv
LLM_API_KEY=your-server-side-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Any trusted provider supporting OpenAI-compatible `/chat/completions` with JSON-object responses can be configured. `OPENAI_API_KEY` and `OPENAI_MODEL` remain supported. `LLM_*` values take precedence. Keys stay in the server API route; never prefix a key with `NEXT_PUBLIC_`. Base URL is operator-controlled, never user-controlled.

Simplifier and parody use separate prompts and preserve meaning. Parody includes curated style examples and three complexity levels. Outputs have the shape:

```json
{
  "mode": "parody",
  "original": "मसँग पैसा छैन।",
  "translation": "My current pecuniary circumstances...",
  "shortExplanation": "मसँग पैसा छैन।",
  "isVerifiedQuote": false,
  "sourceUrl": null,
  "demo": false
}
```

Generated output always has `isVerifiedQuote: false` and `sourceUrl: null`; provider-supplied claims or URLs are ignored. Provider output is type/length-checked. The API enforces 800 input characters, valid modes and complexity, a 30-second upstream timeout, and 20 requests/minute per client IP. The in-memory limiter is a basic, **per-instance** safeguard; use a shared limiter or platform firewall for aggregate production quotas. Client-IP limits assume a trusted hosting proxy. Set provider spend limits before opening a paid endpoint broadly.

## Shareable cartoons

After translating, click **कार्टुन बनाएर पठाऊ**. Preview a square 1080×1080 or story 1080×1920 card, download PNG, or use the native share sheet where supported. Native file sharing falls back to native text sharing or copying text. Clipboard requires localhost or HTTPS.

The canvas renderer waits for bundled Devanagari fonts, wraps paragraphs and long tokens using grapheme boundaries, and reduces font size until all text fits. Very long text is necessarily smaller on square cards; story format gives it more room. Every exported card includes the caricature, an ordinary Nepali cartoon character and a fictional-parody label. Text is read from the completed result, so editing input cannot silently change an existing card.

## Sources and artwork

See [research notes](public/research.md) and [curated data](lib/content.ts). Four NDTV-reported entries have explicit Wagle/Tharoor attribution. Ten further terms were checked against the Ministry-hosted English budget PDF and include page links. That document calls itself an unofficial translation; the UI does not present its English vocabulary as verified spoken quotations. The interview pages did not expose transcripts, so there are no fabricated timestamps or padded quotation collections.

`public/wagle-editorial.png` is the new reference-guided, AI-generated editorial caricature, made with the built-in imagegen tool. Its prompt and references are recorded in the research notes. Existing workspace images are retained but unused. Local fonts are compressed WOFF2 subsets covering Devanagari, Latin and common punctuation, and include their SIL OFL licenses. The export renderer draws its own small ordinary-person character.

## Validate

```sh
npm run typecheck
npm run build
npm test
```

The tests start an isolated production server in explicit demo mode and verify both modes, validation, sample matching, regeneration, complexity and rate limits. The production build must exist first. A provider-contract test uses a local stub provider to check prompt separation, forged-source suppression and invalid upstream responses without a paid AI call. `TEST_PORT` can override the default test port (3217).

Browser QA additionally covers mobile/desktop overflow, tabs and keyboard controls, PNG preview and actual downloaded dimensions, long Devanagari text, clipboard, modal dismissal and reduced motion. Actual live-provider quality requires a configured key and was not inferred from demo responses.

## Deploy to Vercel

Import this repository as a Next.js project, use Node.js 22 LTS, and retain the default `npm run build` command. Configure the environment variables above; deploy without a key for a public demo, or with one for live AI. Set `NEXT_PUBLIC_SITE_URL` to the final canonical URL so social metadata uses absolute image URLs. The generated `/opengraph-image` route returns a 1200×630 PNG.

This project deliberately retains the requested Next.js/Vercel architecture. No Sites-specific runtime conversion or unrelated hosting project is needed. The build and development scripts use Next.js’s supported Webpack option because the local sandbox blocks Turbopack’s worker port.
