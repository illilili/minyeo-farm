"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
import { toOrderStatusLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type LoginUrlResponse = { loginUrl: string };

type GuestOrder = {
  id: number;
  orderNo: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
};

const LOGIN_MESSAGE_TYPE = "MINYEO_AUTH_SUCCESS";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080", []);
  const apiOrigin = useMemo(() => new URL(apiBase).origin, [apiBase]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== apiOrigin) return;
      if (!event.data || event.data.type !== LOGIN_MESSAGE_TYPE) return;
      if (!event.data.accessToken) return;
      localStorage.setItem("accessToken", event.data.accessToken);
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [apiOrigin, router]);

  async function startNaverLogin() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${apiBase}/api/auth/naver/login`, { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error("로그인 URL 생성에 실패했습니다.");
      const raw = await res.text();
      let loginUrl = "";
      try { loginUrl = (JSON.parse(raw) as LoginUrlResponse).loginUrl; } catch { loginUrl = raw; }
      if (!loginUrl.startsWith("http")) throw new Error("로그인 URL 응답 형식이 올바르지 않습니다.");
      const popup = window.open(loginUrl, "minyeo-naver-login", "width=520,height=720");
      if (!popup) setError("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인 URL 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchGuestOrders() {
    const query = new URLSearchParams({ phone: phone.trim(), pin: pin.trim() }).toString();
    return apiGet<GuestOrder[]>(`/api/orders/guest?${query}`);
  }

  async function lookupGuestOrders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupLoading(true); setError(""); setMessage("");
    try {
      const data = await fetchGuestOrders();
      setGuestOrders(data);
      if (data.length === 0) setMessage("일치하는 비회원 주문이 없습니다.");
    } catch (e) {
      setGuestOrders([]);
      setError(e instanceof Error ? e.message : "비회원 주문 조회에 실패했습니다.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function cancelGuestOrder(orderId: number) {
    if (!confirm("결제완료 주문을 취소하시겠습니까?")) return;
    setError(""); setMessage("");
    try {
      await apiPatch(`/api/orders/guest/${orderId}/cancel`, { phone: phone.trim(), orderPin: pin.trim() });
      const refreshed = await fetchGuestOrders();
      setGuestOrders(refreshed);
      setMessage("주문을 취소했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "비회원 주문 취소에 실패했습니다.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      {/* 로그인 카드 */}
      <div className="rounded-2xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-8 text-center space-y-5">
        <div>
          <p className="text-2xl mb-1">🌿</p>
          <h1 className="text-xl font-bold text-[var(--farm-text)]">미녀농장 로그인</h1>
          <p className="text-sm text-[var(--farm-muted)] mt-1">네이버 계정으로 간편하게 시작하세요</p>
        </div>

        <Button
          onClick={startNaverLogin}
          disabled={loading}
          className="w-full h-12 text-base !text-white font-semibold"
          style={{ background: "#03C75A" }}
        >
          {loading ? "로그인 준비중..." : (
            <span className="flex items-center gap-2 justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 로그인
            </span>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1 bg-[var(--farm-line)]" />
          <span className="text-xs text-[var(--farm-muted)]">또는</span>
          <Separator className="flex-1 bg-[var(--farm-line)]" />
        </div>

        <Button asChild variant="outline" className="w-full border-[var(--farm-line)] text-[var(--farm-muted)]">
          <Link href="/products">비회원으로 이용하기</Link>
        </Button>

        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
      </div>

      {/* 비회원 주문 조회 */}
      <div className="rounded-2xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-6 space-y-4">
        <h2 className="font-bold text-[var(--farm-text)]">비회원 주문 조회</h2>
        <form onSubmit={lookupGuestOrders} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm text-[var(--farm-text)]">연락처</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              required
              className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pin" className="text-sm text-[var(--farm-text)]">주문 조회 PIN</Label>
            <Input
              id="pin"
              inputMode="numeric"
              maxLength={4}
              placeholder="숫자 4자리"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              required
              className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)] w-32"
            />
          </div>
          <Button
            type="submit"
            disabled={lookupLoading}
            variant="outline"
            className="w-full border-[var(--farm-olive)] text-[var(--farm-olive)] hover:bg-[var(--farm-olive)] hover:!text-white transition-colors"
          >
            {lookupLoading ? "조회중..." : "주문 조회"}
          </Button>
        </form>

        {message && <p className="text-sm text-[var(--farm-olive)]">{message}</p>}
        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

        {guestOrders.length > 0 && (
          <div className="space-y-3 pt-2">
            <Separator className="bg-[var(--farm-line)]" />
            {guestOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-[var(--farm-line)] p-4 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm text-[var(--farm-text)]">{order.orderNo}</p>
                    <p className="text-xs text-[var(--farm-muted)]">{toOrderStatusLabel(order.orderStatus)}</p>
                  </div>
                  <p className="font-bold text-sm text-[var(--farm-fig)]">{order.totalAmount.toLocaleString()}원</p>
                </div>
                <p className="text-xs text-[var(--farm-muted)]">{new Date(order.createdAt).toLocaleString("ko-KR")}</p>
                {order.orderStatus === "PAID" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cancelGuestOrder(order.id)}
                    className="w-full mt-1 border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] !hover:text-white text-xs"
                  >
                    주문 취소
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
