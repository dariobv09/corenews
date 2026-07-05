import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LegalPolicies from "@/components/LegalPolicies";
// Force Vercel rebuild with latest TikTok signature

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
      'tiktok-developers-site-verification': ['uKl96SohVZZSudi1ctuTSdjKO9Vw5Df5'],
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7071987980722498"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-[#0a0a0c] dark:text-[#ededf0] transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <LegalPolicies />
        </ThemeProvider>
      </body>
    </html>
  );
}

