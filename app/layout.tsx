import type { Metadata, Viewport } from "next";
import "./globals.css";
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f7f0df",
};
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "WagleGPT — कुरा उही। शब्द अलि ठूला।",
  description: "जटिल कुरा सजिलै बुझौं। सामान्य कुरा जटिल बनाऔं। नेपाली शब्द, हाँसो र share गर्ने कार्टुन — an unofficial vocabulary parody.",
  openGraph: { title: "WagleGPT — कुरा उही। शब्द अलि ठूला।", description: "Oxford Dictionary पनि कहिलेकाहीँ हार खान्छ। Unofficial Nepali vocabulary satire.", locale: "ne_NP", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "WagleGPT", description: "जटिल कुरा सजिलै बुझौं। सामान्य कुरा जटिल बनाऔं।", images: ["/opengraph-image"] },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ne"><body>{children}</body></html>;
}
