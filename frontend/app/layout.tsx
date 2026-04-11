import "./globals.css";
import type { ReactNode } from "react";
import { Noto_Sans_KR } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import PolicyModals from "@/components/PolicyModals";
import { cn } from "@/lib/utils";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "미녀농장 – 산지직송 제철 농산물",
  description: "미녀농장의 오늘 수확한 신선한 무화과·고구마를 산지에서 바로 보내드립니다.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={cn(notoSansKR.variable)}>
      <body className="font-[family-name:var(--font-sans)] bg-[var(--background)] text-[var(--foreground)] antialiased">
        <SiteHeader />

        <main className="min-h-[calc(100vh-64px-180px)]">
          {children}
        </main>

        <footer className="border-t border-[var(--farm-line)] bg-[var(--farm-surface)] mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-4">
            <PolicyModals />
            <div className="space-y-1 text-xs text-[var(--farm-muted)]">
              <p>상호명: 미녀농장 &nbsp;|&nbsp; 대표: 홍길동 &nbsp;|&nbsp; 사업자등록번호: 111-11-11111</p>
              <p>통신판매업신고: 제2026-○○○○-1111호 &nbsp;|&nbsp; 주소: (실제 주소 기입 예정)</p>
              <p>고객센터: 010-1111-1111 &nbsp;|&nbsp; 이메일: help@minyeofarm.kr</p>
              <p>운영시간: 평일 10:00 – 18:00 (주말·공휴일 휴무) &nbsp;|&nbsp; © 2026 미녀농장</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
