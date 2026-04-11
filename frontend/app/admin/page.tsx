"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { toOrderStatusLabel } from "@/lib/labels";
import AdminTabs from "@/components/AdminTabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "PENDING" | "PAID" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELED";

type Order = {
  id: number;
  orderNo: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  buyerName: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
};

function todayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   "text-[var(--farm-muted)]",
  PAID:      "text-[var(--farm-olive)] font-semibold",
  PREPARING: "text-blue-600 font-semibold",
  SHIPPING:  "text-amber-600 font-semibold",
  DELIVERED: "text-[var(--farm-text)]",
  CANCELED:  "text-[var(--destructive)]",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Order[]>("/api/admin/orders")
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const today = todayKST();
  const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === today);

  const stats = {
    needAction:   orders.filter((o) => o.orderStatus === "PAID").length,
    preparing:    orders.filter((o) => o.orderStatus === "PREPARING").length,
    shipping:     orders.filter((o) => o.orderStatus === "SHIPPING").length,
    todayCount:   todayOrders.length,
    todayRevenue: todayOrders
      .filter((o) => !["PENDING", "CANCELED"].includes(o.orderStatus))
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--farm-text)]">관리자 대시보드</h1>
        <AdminTabs />
      </div>

      {/* 처리 필요 배너 */}
      {!loading && stats.needAction > 0 && (
        <div className="rounded-xl bg-[var(--farm-olive)] text-white px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">결제완료 주문 {stats.needAction}건이 대기 중이에요</p>
            <p className="text-white/75 text-sm mt-0.5">상품을 준비하고 배송을 시작해주세요</p>
          </div>
          <Button asChild size="sm" className="bg-white text-[var(--farm-olive)] hover:bg-white/90 font-bold shrink-0">
            <Link href="/admin/orders">바로 처리하기 →</Link>
          </Button>
        </div>
      )}

      {/* 핵심 지표 4개 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "처리 필요",  value: stats.needAction,  sub: "결제완료",  color: stats.needAction > 0 ? "border-[var(--farm-olive)]" : "border-[var(--farm-line)]", valueColor: "text-[var(--farm-olive)]" },
          { label: "배송 준비중", value: stats.preparing,  sub: "준비중",    color: "border-[var(--farm-line)]", valueColor: "text-blue-600" },
          { label: "배송중",     value: stats.shipping,   sub: "진행중",    color: "border-[var(--farm-line)]", valueColor: "text-amber-600" },
          { label: "오늘 주문",  value: stats.todayCount, sub: `${stats.todayRevenue.toLocaleString()}원`, color: "border-[var(--farm-line)]", valueColor: "text-[var(--farm-fig)]" },
        ].map((card) => (
          <Link key={card.label} href="/admin/orders"
            className={`rounded-xl border ${card.color} bg-[var(--farm-surface)] p-4 hover:shadow-md transition-shadow`}
          >
            <p className="text-xs text-[var(--farm-muted)]">{card.label}</p>
            <p className={`text-4xl font-bold mt-1 ${card.valueColor}`}>
              {loading ? "—" : card.value}
            </p>
            <p className="text-xs text-[var(--farm-muted)] mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* 최근 주문 */}
      <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[var(--farm-text)]">최근 주문</h2>
          <Link href="/admin/orders" className="text-xs text-[var(--farm-olive)] hover:underline">전체 보기 →</Link>
        </div>
        <Separator className="bg-[var(--farm-line)]" />

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-10 rounded bg-[var(--farm-beige-soft)] animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-[var(--farm-muted)] py-6 text-center">아직 주문이 없습니다.</p>
        ) : (
          <div className="divide-y divide-[var(--farm-line)]">
            {recent.map((order) => {
              const firstName = order.items[0]?.productName ?? "상품";
              const extra = order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : "";
              return (
                <div key={order.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--farm-text)]">{order.buyerName}</span>
                      <span className="text-xs text-[var(--farm-muted)]">{firstName}{extra}</span>
                    </div>
                    <p className="text-xs text-[var(--farm-muted)] mt-0.5">
                      {new Date(order.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs ${STATUS_COLOR[order.orderStatus]}`}>
                      {toOrderStatusLabel(order.orderStatus)}
                    </p>
                    <p className="text-sm font-bold text-[var(--farm-fig)]">
                      {order.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 빠른 이동 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/admin/orders",   label: "주문 관리", icon: "📦", desc: "주문 확인·배송 처리" },
          { href: "/admin/products", label: "상품 관리", icon: "🌿", desc: "상품 등록·품절 처리" },
          { href: "/admin/posts",    label: "소식 관리", icon: "📢", desc: "수확·배송 공지" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-4 text-center hover:shadow-md hover:border-[var(--farm-olive)] transition-all"
          >
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-sm font-bold text-[var(--farm-text)]">{item.label}</p>
            <p className="text-xs text-[var(--farm-muted)] mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
