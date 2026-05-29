import type { Metadata } from "next";
import "./globals.css";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";

export const metadata: Metadata = {
  title: "Ticker Taka",
  description: "AI 토론 기반 주식 분석",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen flex overflow-hidden">
        <SideNavBar />
        <TopNavBar />
        <main className="w-full md:w-[calc(100%-260px)] md:ml-[260px] mt-[56px] h-[calc(100vh-56px)] overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
