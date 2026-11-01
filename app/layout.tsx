import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WagleGPT | जटिल कुरा सजिलै बुझौं",
  description: "Unofficial Nepali parody translator for turning simple things impossibly sophisticated.",
  openGraph: {
    title: "WagleGPT",
    description: "जटिल कुरा सजिलै बुझौं। सामान्य कुरा जटिल बनाऔं।",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ne">
      <body>{children}</body>
    </html>
  );
}
