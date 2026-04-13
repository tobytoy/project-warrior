import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/context/ApiKeyContext";
import { Shell } from "@/components/Shell";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WarriorHub - Project Demo Collection",
  description: "A premium platform to showcase and deploy your AI project demos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ApiKeyProvider>
          <Shell>
            <FirebaseAnalytics />
            {children}
          </Shell>
        </ApiKeyProvider>
      </body>
    </html>
  );
}
