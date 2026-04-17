"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type Me = {
  id: number;
  name: string;
  role: "USER" | "ADMIN";
};

const NAV_LINKS = [
  { href: "/products", label: "상품" },
  { href: "/posts", label: "농장 소식" },
];

export default function SiteHeader() {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);

  const syncMe = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setMe(null); return; }
    apiGet<Me>("/api/me")
      .then(setMe)
      .catch(() => { localStorage.removeItem("accessToken"); setMe(null); });
  }, []);

  useEffect(() => {
    syncMe();
    const onAuthChanged = () => syncMe();
    const onStorage = (e: StorageEvent) => { if (e.key === "accessToken") syncMe(); };
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [syncMe]);

  function logout() {
    localStorage.removeItem("accessToken");
    setMe(null);
    window.dispatchEvent(new Event("auth-changed"));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--farm-line)] bg-[var(--farm-surface)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-[var(--farm-fig)] leading-none">
            미녀농장
          </span>
          <span className="hidden sm:inline text-xs text-[var(--farm-muted)] border-l border-[var(--farm-line)] pl-2">
            산지직송 농산물
          </span>
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-[var(--farm-text)] hover:text-[var(--farm-olive)] transition-colors rounded-md hover:bg-[var(--farm-beige-soft)]"
            >
              {link.label}
            </Link>
          ))}
          {me?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-3 py-2 text-sm text-[var(--farm-fig)] hover:text-[var(--farm-fig-dark)] transition-colors rounded-md hover:bg-[var(--farm-beige-soft)]"
            >
              관리자
            </Link>
          )}
        </nav>

        {/* 데스크탑 우측 */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/cart"
            className="px-3 py-2 text-sm text-[var(--farm-text)] hover:text-[var(--farm-olive)] transition-colors rounded-md hover:bg-[var(--farm-beige-soft)]"
          >
            장바구니
          </Link>
          {me ? (
            <>
              <Link
                href="/mypage"
                className="px-3 py-2 text-sm text-[var(--farm-text)] hover:text-[var(--farm-olive)] transition-colors rounded-md hover:bg-[var(--farm-beige-soft)]"
              >
                {me.name}님
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-[var(--farm-line)] text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] hover:text-[var(--farm-text)]"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white"
            >
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[var(--farm-surface)] border-[var(--farm-line)]">
            <div className="pt-4 pb-2">
              <p className="text-lg font-bold text-[var(--farm-fig)]">미녀농장</p>
              <p className="text-xs text-[var(--farm-muted)]">산지직송 농산물</p>
            </div>
            <Separator className="my-4 bg-[var(--farm-line)]" />
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-[var(--farm-text)] hover:text-[var(--farm-olive)] hover:bg-[var(--farm-beige-soft)] rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--farm-text)] hover:text-[var(--farm-olive)] hover:bg-[var(--farm-beige-soft)] rounded-md transition-colors"
              >
                장바구니
              </Link>
              {me?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-[var(--farm-fig)] hover:bg-[var(--farm-beige-soft)] rounded-md transition-colors"
                >
                  관리자
                </Link>
              )}
            </nav>
            <Separator className="my-4 bg-[var(--farm-line)]" />
            {me ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/mypage"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-[var(--farm-text)] hover:bg-[var(--farm-beige-soft)] rounded-md transition-colors"
                >
                  {me.name}님 · 마이페이지
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { logout(); setOpen(false); }}
                  className="border-[var(--farm-line)] text-[var(--farm-muted)]"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full block text-center py-2.5 rounded-lg bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] text-white font-medium transition-colors"
              >
                로그인
              </Link>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
