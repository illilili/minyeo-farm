"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { toOrderStatusLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Me = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: "USER" | "ADMIN";
  provider: "NAVER";
};

type OrderSummary = {
  id: number;
  orderNo: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
};

type OrderPage = { content: OrderSummary[] };

type OrderItem = {
  orderItemId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
  reviewWritable: boolean;
};

type OrderDetail = {
  id: number;
  orderNo: string;
  orderStatus: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
  courierCode?: string;
  trackingNumber?: string;
  items: OrderItem[];
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  PAID: "default",
  PREPARING: "secondary",
  SHIPPING: "secondary",
  DELIVERED: "default",
  CANCELED: "destructive",
};

export default function MyPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [ratingByItem, setRatingByItem] = useState<Record<number, number>>({});
  const [contentByItem, setContentByItem] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshOrders() {
    const data = await apiGet<OrderPage>("/api/my/orders?page=0&size=20");
    setOrders(data.content);
    if (!selectedOrderId && data.content.length > 0) setSelectedOrderId(data.content[0].id);
  }

  async function refreshDetail(orderId: number) {
    const data = await apiGet<OrderDetail>(`/api/my/orders/${orderId}`);
    setDetail(data);
  }

  useEffect(() => {
    apiGet<Me>("/api/me").then(setMe).catch(() => setMe(null));
    refreshOrders().catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    refreshDetail(selectedOrderId).catch((e: Error) => setError(e.message));
  }, [selectedOrderId]);

  async function submitReview(event: FormEvent<HTMLFormElement>, orderItemId: number) {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      const rating = ratingByItem[orderItemId] ?? 5;
      const content = (contentByItem[orderItemId] ?? "").trim();
      if (!content) { setError("후기 내용을 입력해주세요."); return; }
      await apiPost("/api/reviews", { orderItemId, rating, content });
      setMessage("후기를 등록했습니다.");
      setContentByItem((prev) => ({ ...prev, [orderItemId]: "" }));
      if (selectedOrderId) await refreshDetail(selectedOrderId);
    } catch (e) { setError(e instanceof Error ? e.message : "후기 등록에 실패했습니다."); }
  }

  async function cancelOrder(orderId: number) {
    if (!confirm("주문을 취소하시겠습니까?")) return;
    setMessage(""); setError("");
    try {
      await apiPatch(`/api/my/orders/${orderId}/cancel`, {});
      setMessage("주문을 취소했습니다.");
      await refreshOrders();
      if (selectedOrderId) await refreshDetail(selectedOrderId);
    } catch (e) { setError(e instanceof Error ? e.message : "주문 취소에 실패했습니다."); }
  }

  const summary = useMemo(() => ({
    totalOrders: orders.length,
    paid: orders.filter((o) => o.orderStatus === "PAID").length,
    shipping: orders.filter((o) => o.orderStatus === "SHIPPING").length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
  }), [orders]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--farm-text)]">마이페이지</h1>

      {/* 프로필 + 안내 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--farm-text)]">내 정보</h2>
            {me && <Badge variant={me.role === "ADMIN" ? "default" : "secondary"}>{me.role === "ADMIN" ? "관리자" : "일반 회원"}</Badge>}
          </div>
          {!me ? (
            <p className="text-sm text-[var(--farm-muted)]">회원 정보를 불러오는 중...</p>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-[var(--farm-text)]">{me.name}님</p>
              <div className="space-y-1 text-sm text-[var(--farm-muted)]">
                <p>이메일: {me.email || "-"}</p>
                <p>연락처: {me.phone || "-"}</p>
                <p>연동: {me.provider}</p>
              </div>
            </div>
          )}
        </div>

        {/* 주문 현황 */}
        <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-3">
          <h2 className="font-bold text-[var(--farm-text)]">주문 현황</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "전체", value: summary.totalOrders },
              { label: "결제완료", value: summary.paid },
              { label: "배송중", value: summary.shipping },
              { label: "배송완료", value: summary.delivered },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[var(--farm-beige-soft)] p-3">
                <p className="text-xs text-[var(--farm-muted)]">{label}</p>
                <p className="text-xl font-bold text-[var(--farm-fig)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주문 내역 + 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* 주문 목록 */}
        <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--farm-text)]">주문 내역</h2>
            <span className="text-xs text-[var(--farm-muted)]">최근 20건</span>
          </div>
          <Separator className="bg-[var(--farm-line)]" />
          {orders.length === 0 ? (
            <p className="text-sm text-[var(--farm-muted)] py-8 text-center">주문 내역이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-lg p-3 text-left transition-colors border ${
                    selectedOrderId === order.id
                      ? "border-[var(--farm-olive)] bg-[var(--farm-beige-soft)]"
                      : "border-[var(--farm-line)] hover:bg-[var(--farm-beige-soft)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[var(--farm-text)] truncate">{order.orderNo}</p>
                      <p className="text-xs text-[var(--farm-muted)] mt-0.5">{new Date(order.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={STATUS_VARIANT[order.orderStatus] ?? "outline"} className="text-xs mb-1">
                        {toOrderStatusLabel(order.orderStatus)}
                      </Badge>
                      <p className="text-sm font-bold text-[var(--farm-fig)]">{order.totalAmount.toLocaleString()}원</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 주문 상세 */}
        {detail && (
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--farm-text)]">선택 주문 상세</h2>
              <Badge variant={STATUS_VARIANT[detail.orderStatus] ?? "outline"}>{toOrderStatusLabel(detail.orderStatus)}</Badge>
            </div>
            <Separator className="bg-[var(--farm-line)]" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--farm-muted)]">주문번호</span><span className="font-medium text-[var(--farm-text)]">{detail.orderNo}</span></div>
              <div className="flex justify-between"><span className="text-[var(--farm-muted)]">주문일</span><span className="text-[var(--farm-text)]">{new Date(detail.createdAt).toLocaleString("ko-KR")}</span></div>
              <div className="flex justify-between"><span className="text-[var(--farm-muted)]">상품 금액</span><span className="text-[var(--farm-text)]">{detail.subtotalAmount.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[var(--farm-muted)]">배송비</span><span className="text-[var(--farm-text)]">{detail.shippingFee === 0 ? "무료" : `${detail.shippingFee.toLocaleString()}원`}</span></div>
              <div className="flex justify-between font-bold"><span className="text-[var(--farm-text)]">결제 금액</span><span className="text-[var(--farm-fig)]">{detail.totalAmount.toLocaleString()}원</span></div>
            </div>

            {(detail.courierCode || detail.trackingNumber) && (
              <div className="rounded-lg bg-[var(--farm-beige-soft)] border border-[var(--farm-line)] p-3 text-sm">
                <p className="text-xs text-[var(--farm-muted)] mb-1">배송 정보</p>
                <p className="text-[var(--farm-text)]">{detail.courierCode || "-"} / {detail.trackingNumber || "-"}</p>
              </div>
            )}

            {(detail.orderStatus === "PENDING" || detail.orderStatus === "PAID") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cancelOrder(detail.id)}
                className="w-full border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:!text-white"
              >
                주문 취소
              </Button>
            )}
            {(detail.orderStatus === "PREPARING" || detail.orderStatus === "SHIPPING" || detail.orderStatus === "DELIVERED") && (
              <p className="text-xs text-[var(--farm-muted)]">환불 문의는 고객센터 전화/문자로 접수 부탁드립니다.</p>
            )}

            <Separator className="bg-[var(--farm-line)]" />

            {/* 상품별 후기 */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-[var(--farm-text)]">주문 상품</h3>
              {detail.items.map((item) => (
                <div key={item.orderItemId} className="rounded-lg border border-[var(--farm-line)] p-3 space-y-3">
                  <div>
                    <p className="font-medium text-sm text-[var(--farm-text)]">{item.productName}</p>
                    <p className="text-xs text-[var(--farm-muted)] mt-0.5">{item.quantity}개 · {item.lineAmount.toLocaleString()}원</p>
                  </div>

                  {item.reviewWritable ? (
                    <form onSubmit={(e) => submitReview(e, item.orderItemId)} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--farm-muted)]">평점</span>
                        <select
                          value={ratingByItem[item.orderItemId] ?? 5}
                          onChange={(e) => setRatingByItem((prev) => ({ ...prev, [item.orderItemId]: Number(e.target.value) }))}
                          className="h-8 rounded-md border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-2 text-xs text-[var(--farm-text)] outline-none focus:ring-1 focus:ring-[var(--farm-olive)]"
                        >
                          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{'⭐'.repeat(s)} {s}점</option>)}
                        </select>
                      </div>
                      <textarea
                        rows={3}
                        value={contentByItem[item.orderItemId] ?? ""}
                        onChange={(e) => setContentByItem((prev) => ({ ...prev, [item.orderItemId]: e.target.value }))}
                        placeholder="상품 후기를 작성해주세요."
                        className="w-full rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 py-2 text-xs text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)] resize-none placeholder:text-[var(--farm-muted)]"
                      />
                      <Button type="submit" size="sm" className="w-full bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white">
                        후기 작성
                      </Button>
                    </form>
                  ) : (
                    <p className="text-xs text-[var(--farm-muted)]">후기 작성 대상이 아니거나 이미 작성된 상품입니다.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-[var(--farm-olive)] font-medium">{message}</p>}
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
