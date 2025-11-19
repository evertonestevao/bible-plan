import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import MenuWrapper from "@/components/ui/MenuWrapper";
import { UserProvider } from "@/contexts/UserContext";
import { Providers } from "../providers"; //  ⬅️ IMPORTANTE

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bíblia",
  description: "Plano de leitura e estudo da Bíblia",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
      </head>

      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased scroll-smooth 
          bg-[#f8f8f5] text-gray-800
          dark:bg-[#111418] dark:text-gray-200
          transition-colors duration-300
        `}
      >
        <Providers>
          <UserProvider>
            {children}
            <Toaster />
            <MenuWrapper />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
