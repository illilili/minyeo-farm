"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded-2xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-10 space-y-6">
        <div className="text-5xl">😞</div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--farm-text)]">결제에 실패했습니다</h1>
          <p className="text-sm text-[var(--farm-muted)]">다시 시도하거나 고객센터로 문의해주세요.</p>
        </div>

        {(orderId || code || message) && (
          <div className="rounded-lg bg-[var(--farm-beige-soft)] border border-[var(--farm-line)] p-4 text-left space-y-1 text-sm">
            {orderId && <p className="text-[var(--farm-muted)]">주문번호: <span className="text-[var(--farm-text)]">{orderId}</span></p>}
            {code && <p className="text-[var(--farm-muted)]">오류코드: <span className="text-[var(--farm-text)]">{code}</span></p>}
            {message && <p className="text-[var(--farm-muted)]">오류내용: <span className="text-[var(--destructive)]">{message}</span></p>}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white">
            <Link href="/order">다시 주문하기</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-[var(--farm-line)] text-[var(--farm-muted)]">
            <Link href="/products">상품 보러가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl animate-pulse">🌿</div>
        <p className="text-[var(--farm-muted)]">로딩 중...</p>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
