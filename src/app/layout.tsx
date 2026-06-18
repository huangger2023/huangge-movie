import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "影述学院 · 抖音电影解说创作平台",
  description:
    "专注抖音电影解说创作教学，AI 智能生成独家精选文案，配套爆款标题、黄金开头、文案润色等辅助创作工具，让每一位创作者都能做出百万播放。",
  keywords: ["电影解说", "抖音", "短视频创作", "AI文案", "知识付费", "影视解说"],
  authors: [{ name: "影述学院" }],
  openGraph: {
    title: "影述学院 · 抖音电影解说创作平台",
    description: "AI 生成独家精选文案，让电影解说创作更高效",
    siteName: "影述学院",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
