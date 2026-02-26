import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Job Spyde — Your Intelligent Career Command Center",
  description: "AI-powered job discovery, resume tailoring, and application tracking for students and early professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0e1a] text-slate-100 flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
