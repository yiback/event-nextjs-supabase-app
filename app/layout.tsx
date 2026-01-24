import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "모임 이벤트 관리",
    template: "%s | 모임 이벤트 관리",
  },
  description:
    "소규모 모임의 이벤트 참석 관리와 공지를 효율적으로 처리하는 서비스",
  keywords: ["모임", "이벤트", "참석 관리", "공지", "그룹"],
  authors: [{ name: "Event Management Team" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: defaultUrl,
    siteName: "모임 이벤트 관리",
    title: "모임 이벤트 관리",
    description:
      "소규모 모임의 이벤트 참석 관리와 공지를 효율적으로 처리하는 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "모임 이벤트 관리",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "모임 이벤트 관리",
    description:
      "소규모 모임의 이벤트 참석 관리와 공지를 효율적으로 처리하는 서비스",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased bg-gray-100`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {/* 모바일 사이즈 컨테이너 - 중앙 정렬 */}
            <div className="mx-auto w-full max-w-[480px] min-h-screen bg-background shadow-sm">
              {children}
            </div>
            <Toaster position="top-center" richColors />
          </Providers>
          {/* Vercel 성능 모니터링 */}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
