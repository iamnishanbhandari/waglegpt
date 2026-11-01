# WagleGPT

WagleGPT is a mobile-first, Nepali editorial-cartoon parody translator built with Next.js and TypeScript. It is not affiliated with, endorsed by, or operated by Swarnim Wagle.

## Features

- Wagle → Nepali simplifier
- Nepali → exaggerated parody mode
- Demo responses when no provider key is configured
- Server-side OpenAI-compatible translation route
- Curated vocabulary cards with explicit source and speaker attribution
- Copy, native share, square PNG, and story PNG export
- Mobile-first comic newspaper design
- Reduced-motion support and basic input/rate limits

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configure AI

Copy `.env.example` to `.env.local` and add an API key:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
```

Without a key, the app deliberately runs in clearly labeled demo mode.

## Deploy to Vercel

1. Import the project in Vercel.
2. Add the environment variables above.
3. Deploy.

Never commit `.env.local` or expose provider keys in client code.

## Artwork and quotations

`public/caricature.svg` is an original satirical illustration developed from the supplied public reference. Replace it only with appropriately licensed caricature artwork or a verified creative depiction.

The vocabulary source links are retained in the lightweight curated dataset. The app only marks items as verified quote data when they have been checked against their original recording or transcript. Generated parody output is always fictional.
