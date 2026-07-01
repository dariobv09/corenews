import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LegalPolicies from "@/components/LegalPolicies";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Core News | Inteligencia de Noticias Verificadas",
  description: "Dashboard personal de inteligencia automatizada sobre Inteligencia Artificial, Tecnología, Economía y Geopolítica.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-icon.jpg",
  },
  verification: {
    other: {
      'tiktok-developers-site-verification': ['6P4J3SQHVjop1g3XRRfYxockBUq85yrq'],
    },
  },
};

export default function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-[#0a0a0c] dark:text-[#ededf0] transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}
          {children}
          <LegalPolicies />
        </ThemeProvider>
      </body>
    </html>
  );
}

