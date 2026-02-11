import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triad News — Novice skozi oči harmonije",
  description:
    "Novičarski portal s triadno analizo: teza, antiteza, sinteza. Preoblikuje novice v konstruktivne, človeštvu usmerjene perspektive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <body
        className={`${playfair.variable} ${dmSans.variable} antialiased`}
        style={{
          fontFamily: "var(--font-dm-sans), var(--font-sans)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
