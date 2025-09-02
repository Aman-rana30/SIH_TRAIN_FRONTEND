import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css"; // <-- ADD THIS LINE
import QueryProvider from "@/components/providers/query-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Railway Controller Dashboard",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <QueryProvider>{children}</QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}