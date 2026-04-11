"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminTabs from "@/components/AdminTabs";
import { apiGet, apiPatch } from "@/lib/api";
import { toOrderStatusLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "PENDING" | "PAID" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELED";

type OrderItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
};

type Order = {
  id: number;
  orderNo: string;
  orderStatus: OrderStatus;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  receiverName: string;
  receiverPhone: string;
  receiverZipcode: string;
  receiverAddress1: string;
  receiverAddress2?: string;
  deliveryRequest?: string;
  courierCode?: string;
  trackingNumber?: string;
  items: OrderItem[];
};

const STATUS_TABS: { key: OrderStatus | "ALL"; label: string }[] = [
  { key: "ALL",       label: "전체" },
  { key: "PAID",      label: "결제완료" },
  { key: "PREPARING", label: "준비중" },
  { key: "SHIPPING",  label: "배송중" },
  { key: "DELIVERED", label: "배송완료" },
  { key: "CANCELED",  label: "취소" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING:   "bg-gray-100 text-gray-500",
  PAID:      "bg-green-100 text-green-700",
  PREPARING: "bg-blue-100 text-blue-700",
  SHIPPING:  "bg-amber-100 text-amber-700",
  DELIVERED: "bg-[var(--farm-beige-soft)] text-[var(--farm-text)]",
  CANCELED:  "bg-red-50 text-red-500",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("PAID");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 배송 시작 입력
  const [shippingTarget, setShippingTarget] = useState<number | null>(null);
  const [courierCode, setCourierCode] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // 환불 입력
  const [refundTarget, setRefundTarget] = useState<number | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const data = await apiGet<Order[]>("/api/admin/orders");
    setOrders(data);
  }

  useEffect(() => {
    refresh().catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const map: Partial<Record<OrderStatus | "ALL", number>> = { ALL: orders.length };
    for (const o of orders) map[o.orderStatus] = (map[o.orderStatus] ?? 0) + 1;
    return map;
  }, [orders]);

  const filtered = useMemo(() =>
    activeTab === "ALL" ? orders : orders.filter((o) => o.orderStatus === activeTab),
    [orders, activeTab]
  );

  function feedback(msg: string) { setMessage(msg); setError(""); }
  function errback(e: unknown) { setError(e instanceof Error ? e.message : "오류가 발생했습니다."); setMessage(""); }

  async function startPreparing(orderId: number) {
    try {
      await apiPatch(`/api/admin/orders/${orderId}/status`, { orderStatus: "PREPARING" });
      feedback("준비 시작으로 변경했습니다.");
      await refresh();
    } catch (e) { errback(e); }
  }

  async function startShipping(e: FormEvent, order: Order) {
    e.preventDefault();
    if (!courierCode.trim() || !trackingNumber.trim()) { setError("택배사 코드와 운송장 번호를 모두 입력해주세요."); return; }
    try {
      await apiPatch(`/api/admin/orders/${order.id}/tracking`, { courierCode: courierCode.trim(), trackingNumber: trackingNumber.trim() });
      await apiPatch(`/api/admin/orders/${order.id}/status`, { orderStatus: "SHIPPING" });
      setShippingTarget(null); setCourierCode(""); setTrackingNumber("");
      feedback("배송을 시작했습니다.");
      await refresh();
    } catch (e) { errback(e); }
  }

  async function markDelivered(orderId: number) {
    if (!confirm("배송 완료로 처리할까요?")) return;
    try {
      await apiPatch(`/api/admin/orders/${orderId}/status`, { orderStatus: "DELIVERED" });
      feedback("배송 완료로 변경했습니다.");
      await refresh();
    } catch (e) { errback(e); }
  }

  async function cancelOrder(orderId: number, status: OrderStatus) {
    if (!confirm("이 주문을 취소하시겠습니까?")) return;
    try {
      if (status === "PAID") {
        await apiPatch(`/api/admin/orders/${orderId}/refund`, { cancelReason: "관리자 취소" });
      } else {
        await apiPatch(`/api/admin/orders/${orderId}/status`, { orderStatus: "CANCELED" });
      }
      feedback("주문을 취소했습니다.");
      await refresh();
    } catch (e) { errback(e); }
  }

  async function processRefund(e: FormEvent, orderId: number) {
    e.preventDefault();
    if (!refundReason.trim()) { setError("환불 사유를 입력해주세요."); return; }
    const payload: { cancelReason: string; cancelAmount?: number } = { cancelReason: refundReason.trim() };
    if (refundAmount) {
      const amt = Number(refundAmount);
      if (!Number.isFinite(amt) || amt < 1) { setError("환불 금액을 올바르게 입력해주세요."); return; }
      payload.cancelAmount = amt;
    }
    try {
      await apiPatch(`/api/admin/orders/${orderId}/refund`, payload);
      setRefundTarget(null); setRefundReason(""); setRefundAmount("");
      feedback(payload.cancelAmount ? "부분 환불을 처리했습니다." : "전액 환불을 처리했습니다.");
      await refresh();
    } catch (e) { errback(e); }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-5">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--farm-text)]">주문 관리</h1>
        <AdminTabs />
      </div>

      {/* 상태별 탭 */}
      <div className="flex gap-1 flex-wrap border-b border-[var(--farm-line)]">
        {STATUS_TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0;
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                active
                  ? "border-[var(--farm-olive)] text-[var(--farm-olive)]"
                  : "border-transparent text-[var(--farm-muted)] hover:text-[var(--farm-text)]"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  active ? "bg-[var(--farm-olive)] text-white" : "bg-[var(--farm-beige-soft)] text-[var(--farm-muted)]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {message && <p className="text-sm text-[var(--farm-olive)] font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{message}</p>}
      {error   && <p className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>}

      {/* 주문 목록 */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--farm-beige-soft)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--farm-muted)]">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">해당 상태의 주문이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const isShipping = shippingTarget === order.id;
            const isRefund = refundTarget === order.id;
            const itemsSummary = order.items.map((i) => `${i.productName} ${i.quantity}개`).join(", ");

            return (
              <div key={order.id} className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] overflow-hidden">
                {/* 요약 행 */}
                <div className="flex items-center gap-3 p-4">
                  {/* 상태 점 */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    order.orderStatus === "PAID"      ? "bg-green-500" :
                    order.orderStatus === "PREPARING" ? "bg-blue-500" :
                    order.orderStatus === "SHIPPING"  ? "bg-amber-500" :
                    order.orderStatus === "DELIVERED" ? "bg-gray-400" :
                    order.orderStatus === "CANCELED"  ? "bg-red-400" : "bg-gray-300"
                  }`} />

                  {/* 주문 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[var(--farm-text)]">{order.buyerName}</span>
                      <span className="text-xs text-[var(--farm-muted)] truncate">{itemsSummary}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--farm-muted)]">
                      <span>{order.orderNo}</span>
                      <span>·</span>
                      <span>{new Date(order.createdAt).toLocaleString("ko-KR")}</span>
                    </div>
                  </div>

                  {/* 금액 + 상태 */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-[var(--farm-fig)]">{order.totalAmount.toLocaleString()}원</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.orderStatus]}`}>
                      {toOrderStatusLabel(order.orderStatus)}
                    </span>
                  </div>

                  {/* 주요 액션 버튼 */}
                  <div className="flex items-center gap-2 shrink-0">
                    {order.orderStatus === "PAID" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => startPreparing(order.id)}
                        className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white text-xs h-8"
                      >
                        준비 시작
                      </Button>
                    )}
                    {order.orderStatus === "PREPARING" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setShippingTarget(isShipping ? null : order.id);
                          setExpandedId(order.id);
                          setCourierCode(order.courierCode ?? "");
                          setTrackingNumber(order.trackingNumber ?? "");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 !text-white text-xs h-8"
                      >
                        배송 시작
                      </Button>
                    )}
                    {order.orderStatus === "SHIPPING" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => markDelivered(order.id)}
                        variant="outline"
                        className="border-amber-500 text-amber-600 text-xs h-8"
                      >
                        배송 완료
                      </Button>
                    )}

                    {/* 펼치기 버튼 */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="w-8 h-8 flex items-center justify-center text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] rounded-lg transition-colors text-lg"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* 펼쳐진 상세 */}
                {isExpanded && (
                  <div className="border-t border-[var(--farm-line)] bg-[var(--farm-beige-soft)]/40">
                    {/* 배송 시작 운송장 입력 */}
                    {isShipping && (
                      <form onSubmit={(e) => startShipping(e, order)} className="p-4 bg-blue-50 border-b border-blue-100 space-y-3">
                        <p className="text-sm font-semibold text-blue-700">📦 운송장 번호 입력 후 배송 시작</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-blue-600">택배사 코드</label>
                            <Input
                              placeholder="예: CJGLS"
                              value={courierCode}
                              onChange={(e) => setCourierCode(e.target.value)}
                              className="h-9 text-sm border-blue-200 bg-white focus-visible:ring-blue-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-blue-600">운송장 번호</label>
                            <Input
                              placeholder="숫자 입력"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              className="h-9 text-sm border-blue-200 bg-white focus-visible:ring-blue-400"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 !text-white">배송 시작 확정</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setShippingTarget(null)} className="text-xs">취소</Button>
                        </div>
                      </form>
                    )}

                    {/* 환불 폼 */}
                    {isRefund && (
                      <form onSubmit={(e) => processRefund(e, order.id)} className="p-4 bg-red-50 border-b border-red-100 space-y-3">
                        <p className="text-sm font-semibold text-red-600">💳 환불 처리</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-red-500">환불 사유 (필수)</label>
                            <Input placeholder="환불 사유" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="h-9 text-sm border-red-200 bg-white" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-red-500">부분 환불 금액 (선택, 비우면 전액)</label>
                            <Input placeholder="금액 (원)" inputMode="numeric" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value.replace(/\D/g, ""))} className="h-9 text-sm border-red-200 bg-white" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="bg-red-500 hover:bg-red-600 !text-white">환불 확정</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setRefundTarget(null)} className="text-xs">취소</Button>
                        </div>
                      </form>
                    )}

                    <div className="p-4 space-y-4">
                      {/* 주문 상품 */}
                      <div>
                        <p className="text-xs font-semibold text-[var(--farm-muted)] mb-2">주문 상품</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span className="text-[var(--farm-text)]">{item.productName} × {item.quantity}개</span>
                              <span className="text-[var(--farm-fig)] font-medium">{item.lineAmount.toLocaleString()}원</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs text-[var(--farm-muted)] pt-1 border-t border-[var(--farm-line)]">
                            <span>배송비</span>
                            <span>{order.shippingFee === 0 ? "무료" : `${order.shippingFee.toLocaleString()}원`}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-[var(--farm-text)]">
                            <span>합계</span>
                            <span className="text-[var(--farm-fig)]">{order.totalAmount.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-[var(--farm-line)]" />

                      {/* 배송 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-[var(--farm-muted)] mb-1">주문자</p>
                          <p className="text-[var(--farm-text)]">{order.buyerName}</p>
                          <p className="text-xs text-[var(--farm-muted)]">{order.buyerPhone}</p>
                          {order.buyerEmail && <p className="text-xs text-[var(--farm-muted)]">{order.buyerEmail}</p>}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--farm-muted)] mb-1">수령자 · 주소</p>
                          <p className="text-[var(--farm-text)]">{order.receiverName}</p>
                          <p className="text-xs text-[var(--farm-muted)]">{order.receiverPhone}</p>
                          <p className="text-xs text-[var(--farm-muted)]">({order.receiverZipcode}) {order.receiverAddress1} {order.receiverAddress2 || ""}</p>
                          {order.deliveryRequest && <p className="text-xs text-[var(--farm-muted)] mt-1">요청: {order.deliveryRequest}</p>}
                        </div>
                      </div>

                      {/* 배송 추적 */}
                      {(order.courierCode || order.trackingNumber) && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                          <span className="text-amber-700 font-medium">배송 정보: </span>
                          <span className="text-amber-800">{order.courierCode} / {order.trackingNumber}</span>
                        </div>
                      )}

                      {/* 하단 보조 액션 */}
                      <div className="flex gap-2 pt-1">
                        {(order.orderStatus === "PAID" || order.orderStatus === "PREPARING") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOrder(order.id, order.orderStatus)}
                            className="text-xs border-[var(--destructive)] text-[var(--destructive)] hover:bg-red-50"
                          >
                            주문 취소
                          </Button>
                        )}
                        {(order.orderStatus === "PREPARING" || order.orderStatus === "SHIPPING" || order.orderStatus === "DELIVERED") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => { setRefundTarget(isRefund ? null : order.id); }}
                            className="text-xs border-[var(--destructive)] text-[var(--destructive)] hover:bg-red-50"
                          >
                            환불 처리
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
