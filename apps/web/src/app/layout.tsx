import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Job Spyde — Your Intelligent Career Command Center",
  description: "AI-powered job discovery, resume tailoring, and application tracking for students and early professionals.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--bg-deep)] text-[var(--text-primary)] flex flex-col min-h-screen relative overflow-x-hidden`}>
        <div className="grain-overlay" />
        {children}
      </body>
    </html>
  );
}
