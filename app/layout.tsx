import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ViralScore — Know Before You Post",
  description:
    "AI-powered content virality analyzer. Score your posts, get actionable feedback, and go viral.",
  themeColor: "#00ff87",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body
        className="font-body antialiased"
        style={{ background: "#0a0a0a", color: "#f0f0f0" }}
      >
        {children}
      </body>
    </html>
  );
}
