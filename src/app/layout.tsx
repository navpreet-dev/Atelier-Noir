import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = localFont({
  src: "../fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const playfair = localFont({
  src: "../fonts/playfair-latin.woff2",
  variable: "--font-playfair",
  weight: "400 900",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Atelier Noir — Considered Clothing",
  description:
    "Minimal, modern clothing made in small runs from responsible materials. Women's and men's dresses, coats, knitwear, denim and accessories.",
  keywords: ["fashion", "clothing", "minimal fashion", "sustainable clothing", "Atelier Noir"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Atelier Noir — Considered Clothing",
    description:
      "Minimal, modern clothing made in small runs from responsible materials.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-white text-stone-900 font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
