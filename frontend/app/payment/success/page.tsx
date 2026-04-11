"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

type PaymentResponse = {
  paymentId: number;
  tossOrderId: string;
  status: "READY" | "APPROVED" | "FAILED" | "CANCELED";
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const hasRequested = useRef(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [hasAccessToken, setHasAccessToken] = useState(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = Number(searchParams.get("amount"));

  useEffect(() => { setHasAccessToken(!!localStorage.getItem("accessToken")); }, []);

  useEffect(() => {
    if (hasRequested.current) return;
    if (!paymentKey || !orderId || Number.isNaN(amount)) { setError("결제 승인 파라미터가 올바르지 않습니다."); return; }
    hasRequested.current = true;
    apiPost<PaymentResponse>("/api/payments/toss/confirm", { paymentKey, orderId, amount })
      .then(setResult)
      .catch((e: Error) => setError(e.message || "결제 승인에 실패했습니다."));
  }, [amount, orderId, paymentKey]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded-2xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-10 space-y-6">
        {!result && !error && (
          <>
            <div className="text-5xl animate-pulse">🌿</div>
            <p className="text-[var(--farm-muted)]">결제 승인 확인 중입니다...</p>
          </>
        )}

        {result && (
          <>
            <div className="text-5xl">✅</div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[var(--farm-text)]">결제가 완료되었습니다</h1>
              <p className="text-sm text-[var(--farm-muted)]">주문번호: {result.tossOrderId}</p>
            </div>
            <Button asChild className="w-full bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white">
              <Link href={hasAccessToken ? "/mypage" : "/login"}>
                {hasAccessToken ? "마이페이지로 이동" : "주문 조회하기"}
              </Link>
            </Button>
          </>
        )}

        {error && (
          <>
            <div className="text-5xl">❌</div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[var(--farm-text)]">결제 승인 실패</h1>
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            </div>
            <Button asChild variant="outline" className="w-full border-[var(--farm-olive)] text-[var(--farm-olive)]">
              <Link href="/order">주문 페이지로 돌아가기</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
