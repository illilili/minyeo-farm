"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { clearGuestCart, getGuestCart, removeGuestCartItem, updateGuestCartItem } from "@/lib/cart";
import { toProductStatusLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ProductStatus = "ON_SALE" | "SOLD_OUT" | "HIDDEN";

type CartItem = {
  productId: number;
  productName: string;
  price: number;
  status: ProductStatus;
  thumbnailUrl?: string;
  quantity: number;
  lineAmount: number;
};

type ProductDetail = {
  id: number;
  name: string;
  price: number;
  status: ProductStatus;
  thumbnailUrl?: string;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadServerCart() {
    const data = await apiGet<CartItem[]>("/api/my/cart");
    setItems(data);
  }

  async function loadGuestCart() {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) { setItems([]); return; }
    const products = await Promise.all(
      guestItems.map((item) => apiGet<ProductDetail>(`/api/products/${item.productId}`).catch(() => null))
    );
    const mapped = guestItems
      .map((item) => {
        const product = products.find((p) => p?.id === item.productId);
        if (!product) return null;
        return { productId: product.id, productName: product.name, price: product.price, status: product.status, thumbnailUrl: product.thumbnailUrl, quantity: item.quantity, lineAmount: product.price * item.quantity } as CartItem;
      })
      .filter((item): item is CartItem => item !== null);
    setItems(mapped);
  }

  useEffect(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    setIsLoggedIn(hasToken);
    if (hasToken) {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        Promise.all(guestItems.map((item) => apiPost("/api/my/cart", { productId: item.productId, quantity: item.quantity }).catch(() => null)))
          .then(() => { clearGuestCart(); return loadServerCart(); })
          .then(() => setMessage("비회원 장바구니가 계정 장바구니로 동기화되었습니다."))
          .catch((e: Error) => setError(e.message));
      } else {
        loadServerCart().catch((e: Error) => setError(e.message));
      }
    } else {
      loadGuestCart().catch((e: Error) => setError(e.message));
    }
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => {
      const existing = prev.filter((id) => items.some((item) => item.productId === id));
      const newOnes = items.map((item) => item.productId).filter((id) => !existing.includes(id));
      return [...existing, ...newOnes];
    });
  }, [items]);

  const allChecked = items.length > 0 && selectedIds.length === items.length;

  function toggleSelect(id: number, checked: boolean) {
    setSelectedIds((prev) => checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id));
  }

  function checkoutSelected() {
    const selected = items.filter((item) => selectedIds.includes(item.productId)).map((item) => ({ productId: item.productId, quantity: item.quantity }));
    if (selected.length === 0) { setError("주문할 상품을 선택해주세요."); return; }
    sessionStorage.setItem("checkoutDraft", JSON.stringify(selected));
    router.push("/order?from=cart");
  }

  async function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    setMessage(""); setError("");
    try {
      if (isLoggedIn) {
        const data = await apiPatch<CartItem[]>(`/api/my/cart/${productId}`, { quantity });
        setItems(data);
      } else {
        updateGuestCartItem(productId, quantity);
        await loadGuestCart();
      }
    } catch (e) { setError(e instanceof Error ? e.message : "수량 변경에 실패했습니다."); }
  }

  async function removeItem(productId: number) {
    setMessage(""); setError("");
    try {
      if (isLoggedIn) {
        await apiDelete(`/api/my/cart/${productId}`);
        const data = await apiGet<CartItem[]>("/api/my/cart");
        setItems(data);
      } else {
        removeGuestCartItem(productId);
        await loadGuestCart();
      }
    } catch (e) { setError(e instanceof Error ? e.message : "상품 삭제에 실패했습니다."); }
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + item.lineAmount, 0), [items]);
  const selectedTotal = useMemo(() => items.filter((item) => selectedIds.includes(item.productId)).reduce((sum, item) => sum + item.lineAmount, 0), [items, selectedIds]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--farm-text)] mb-8">장바구니</h1>

      {message && <p className="mb-4 text-sm text-[var(--farm-olive)] font-medium">{message}</p>}
      {error && <p className="mb-4 text-sm text-[var(--destructive)]">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* 상품 목록 */}
        <div className="space-y-3">
          {items.length > 0 && (
            <label className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--farm-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => setSelectedIds(e.target.checked ? items.map((i) => i.productId) : [])}
                className="w-4 h-4 accent-[var(--farm-olive)]"
              />
              전체 선택 ({selectedIds.length}/{items.length})
            </label>
          )}

          {items.length === 0 && (
            <div className="text-center py-20 border border-dashed border-[var(--farm-line)] rounded-xl">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-[var(--farm-muted)] text-sm mb-4">장바구니가 비어있습니다</p>
              <Button asChild variant="outline" className="border-[var(--farm-olive)] text-[var(--farm-olive)]">
                <Link href="/products">상품 보러가기</Link>
              </Button>
            </div>
          )}

          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 p-4 rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)]">
              <label className="flex items-start pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.productId)}
                  onChange={(e) => toggleSelect(item.productId, e.target.checked)}
                  className="w-4 h-4 accent-[var(--farm-olive)]"
                />
              </label>

              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--farm-beige-soft)] shrink-0">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-[var(--farm-text)] truncate">{item.productName}</p>
                    <p className="text-xs text-[var(--farm-muted)] mt-0.5">{item.price.toLocaleString()}원 · {toProductStatusLabel(item.status)}</p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.productId)} className="text-xs text-[var(--farm-muted)] hover:text-[var(--destructive)] transition-colors shrink-0">
                    삭제
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[var(--farm-line)] rounded-lg overflow-hidden">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] transition-colors text-sm">−</button>
                    <span className="w-8 text-center text-sm text-[var(--farm-text)]">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] transition-colors text-sm">+</button>
                  </div>
                  <p className="font-bold text-[var(--farm-fig)] text-sm">{item.lineAmount.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 결제 요약 */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <h2 className="font-bold text-[var(--farm-text)]">주문 요약</h2>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--farm-muted)]">
                <span>전체 상품금액</span>
                <span>{total.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-[var(--farm-muted)]">
                <span>선택 상품금액</span>
                <span>{selectedTotal.toLocaleString()}원</span>
              </div>
            </div>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="flex justify-between font-bold text-[var(--farm-text)]">
              <span>결제 예정금액</span>
              <span className="text-[var(--farm-fig)]">{selectedTotal.toLocaleString()}원</span>
            </div>
            <Button
              onClick={checkoutSelected}
              disabled={items.length === 0 || selectedIds.length === 0}
              className="w-full bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white h-11"
            >
              선택 상품 주문하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
