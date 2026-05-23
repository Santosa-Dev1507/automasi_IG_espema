import type { Metadata } from "next";
import { Nunito, DM_Mono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "IG Automation — SMPN 5 Klaten",
  description: "Sistem otomatisasi konten Instagram SMPN 5 Klaten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${nunito.variable} ${dmMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
