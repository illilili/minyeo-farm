"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { removeGuestCartItem } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Product = {
  id: number;
  name: string;
  price: number;
  status: "ON_SALE" | "SOLD_OUT" | "HIDDEN";
};

type ProductPage = {
  content: Product[];
};

type CheckoutDraftItem = {
  productId: number;
  quantity: number;
};

type OrderResponse = {
  id: number;
  orderNo: string;
  totalAmount: number;
};

type PaymentReadyResponse = {
  paymentId: number;
  tossOrderId: string;
  status: "READY" | "APPROVED" | "FAILED" | "CANCELED";
};

type Me = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
};

type TossPaymentsRequestParams = {
  method: "CARD";
  amount: { currency: "KRW"; value: number };
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
};

type TossPaymentWindow = {
  requestPayment(params: TossPaymentsRequestParams): Promise<void> | void;
};

type TossPaymentsInstance = {
  payment(params: { customerKey: string }): TossPaymentWindow;
};

type TossPaymentsFactory = (clientKey: string) => TossPaymentsInstance;

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
};

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: DaumPostcodeData) => void;
}) => { open: () => void };

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
    daum?: { Postcode: DaumPostcodeConstructor };
  }
}

type OrdererForm = {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  orderPin: string;
  receiverName: string;
  receiverPhone: string;
  receiverZipcode: string;
  receiverAddress1: string;
  receiverAddress2: string;
  deliveryRequest: string;
};

const initialForm: OrdererForm = {
  buyerName: "", buyerPhone: "", buyerEmail: "", orderPin: "",
  receiverName: "", receiverPhone: "",
  receiverZipcode: "", receiverAddress1: "", receiverAddress2: "",
  deliveryRequest: ""
};

export default function OrderPage() {
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams.get("productId");
  const quantityFromQuery = searchParams.get("quantity");
  const fromCart = searchParams.get("from") === "cart";
  const isDirectOrderFromProduct = !fromCart && productIdFromQuery !== null;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraftItem[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [form, setForm] = useState<OrdererForm>(initialForm);
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [agreeCancelPolicy, setAgreeCancelPolicy] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPaying, setIsPaying] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setMe(null); return; }
    apiGet<Me>("/api/me")
      .then((data) => {
        setMe(data);
        setForm((prev) => ({ ...prev, buyerName: prev.buyerName || data.name || "", buyerEmail: prev.buyerEmail || data.email || "" }));
      })
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!sameAsOrderer) return;
    setForm((prev) => {
      if (prev.receiverName === prev.buyerName && prev.receiverPhone === prev.buyerPhone) return prev;
      return { ...prev, receiverName: prev.buyerName, receiverPhone: prev.buyerPhone };
    });
  }, [sameAsOrderer, form.buyerName, form.buyerPhone]);

  useEffect(() => {
    if (!fromCart) { setCheckoutDraft([]); return; }
    const raw = sessionStorage.getItem("checkoutDraft");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CheckoutDraftItem[];
      setCheckoutDraft(parsed.filter((item) => item.productId > 0 && item.quantity > 0));
    } catch { setCheckoutDraft([]); }
  }, [fromCart]);

  useEffect(() => {
    const q = Number(quantityFromQuery);
    if (q >= 1 && q <= 10) setQuantity(q);
  }, [quantityFromQuery]);

  useEffect(() => {
    apiGet<ProductPage>("/api/products?status=ON_SALE&page=0&size=20&sort=createdAt,DESC")
      .then((data) => {
        setProducts(data.content);
        if (data.content.length > 0) {
          const queryId = Number(productIdFromQuery);
          const exists = data.content.some((p) => p.id === queryId);
          if (isDirectOrderFromProduct && !exists) { setError("선택한 상품 정보를 찾을 수 없습니다."); return; }
          setSelectedProductId(exists ? queryId : data.content[0].id);
        }
      })
      .catch((e: Error) => setError(e.message || "상품을 불러오지 못했습니다."));
  }, [isDirectOrderFromProduct, productIdFromQuery]);

  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId), [products, selectedProductId]);

  const orderName = useMemo(() => {
    if (fromCart) {
      if (checkoutDraft.length === 0) return "민여농장 상품";
      const first = products.find((p) => p.id === checkoutDraft[0].productId);
      const extra = checkoutDraft.length - 1;
      return extra > 0 ? `${first?.name ?? "민여농장 상품"} 외 ${extra}건` : (first?.name ?? "민여농장 상품");
    }
    return selectedProduct?.name ?? "민여농장 상품";
  }, [checkoutDraft, fromCart, products, selectedProduct]);

  const subtotal = useMemo(() => {
    if (fromCart) return checkoutDraft.reduce((sum, item) => { const p = products.find((x) => x.id === item.productId); return sum + (p?.price ?? 0) * item.quantity; }, 0);
    return (selectedProduct?.price ?? 0) * quantity;
  }, [fromCart, checkoutDraft, products, selectedProduct, quantity]);

  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shippingFee;

  function openPostcodeSearch() {
    if (!window.daum?.Postcode) { setError("주소 검색 스크립트를 불러오지 못했습니다."); return; }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({ ...prev, receiverZipcode: data.zonecode, receiverAddress1: data.roadAddress || data.jibunAddress || "" }));
      }
    }).open();
  }

  function toggleSameAsOrderer(checked: boolean) {
    setSameAsOrderer(checked);
    if (!checked) return;
    setForm((prev) => ({ ...prev, receiverName: prev.buyerName, receiverPhone: prev.buyerPhone }));
  }

  async function payNow(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fromCart && !selectedProductId) { setError("주문할 상품을 선택해주세요."); return; }
    if (fromCart && checkoutDraft.length === 0) { setError("장바구니에서 주문할 상품을 선택해주세요."); return; }
    if (!agreeCancelPolicy) { setError("주문 준비 이후 환불 제한 정책에 동의해주세요."); return; }
    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!tossClientKey) { setError("NEXT_PUBLIC_TOSS_CLIENT_KEY 환경변수가 필요합니다."); return; }
    if (!window.TossPayments) { setError("토스 결제 스크립트를 불러오지 못했습니다."); return; }
    setIsPaying(true); setError("");
    try {
      const created = await apiPost<OrderResponse>("/api/orders", { ...form, items: fromCart ? checkoutDraft : [{ productId: selectedProductId, quantity }] });
      if (fromCart) {
        const hasToken = !!localStorage.getItem("accessToken");
        if (hasToken) await Promise.all(checkoutDraft.map((item) => apiDelete(`/api/my/cart/${item.productId}`)));
        else checkoutDraft.forEach((item) => removeGuestCartItem(item.productId));
        sessionStorage.removeItem("checkoutDraft");
      }
      const ready = await apiPost<PaymentReadyResponse>("/api/payments/toss/ready", { orderId: created.id });
      const tossPayments = window.TossPayments(tossClientKey);
      const payment = tossPayments.payment({ customerKey: me ? `user_${me.id}` : `guest_${created.orderNo}` });
      await payment.requestPayment({ method: "CARD", amount: { currency: "KRW", value: created.totalAmount }, orderId: ready.tossOrderId, orderName, customerName: form.buyerName || "주문자", customerEmail: form.buyerEmail || undefined, successUrl: `${window.location.origin}/payment/success`, failUrl: `${window.location.origin}/payment/fail` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 요청에 실패했습니다.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />
      <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

      <h1 className="text-2xl font-bold text-[var(--farm-text)] mb-8">주문/결제</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* 왼쪽: 폼 */}
        <form id="order-form" onSubmit={payNow} className="space-y-5">

          {/* 상품 정보 */}
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <h2 className="font-bold text-[var(--farm-text)]">주문 상품</h2>
            <Separator className="bg-[var(--farm-line)]" />
            {fromCart ? (
              <div className="space-y-3">
                {checkoutDraft.length === 0 && <p className="text-sm text-[var(--farm-muted)]">선택한 장바구니 상품이 없습니다.</p>}
                {checkoutDraft.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-sm">
                      <span className="text-[var(--farm-text)] font-medium">{product.name}</span>
                      <span className="text-[var(--farm-muted)]">{item.quantity}개 · {(product.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  );
                })}
              </div>
            ) : isDirectOrderFromProduct ? (
              selectedProduct ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--farm-text)] font-medium">{selectedProduct.name}</span>
                  <span className="text-[var(--farm-muted)]">{quantity}개 · {(selectedProduct.price * quantity).toLocaleString()}원</span>
                </div>
              ) : (
                <p className="text-sm text-[var(--farm-muted)]">상품 정보를 불러오는 중...</p>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-[var(--farm-text)]">상품 선택</Label>
                  <select
                    value={selectedProductId ?? ""}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 text-sm text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)]"
                  >
                    {products.length === 0 && <option value="">선택 가능한 상품이 없습니다.</option>}
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()}원)</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-[var(--farm-text)]">수량</Label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-10 rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 text-sm text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => <option key={v} value={v}>{v}개</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 주문자 정보 */}
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <h2 className="font-bold text-[var(--farm-text)]">주문자 정보</h2>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="buyerName" className="text-sm text-[var(--farm-text)]">이름</Label>
                <Input id="buyerName" value={form.buyerName} onChange={(e) => setForm((p) => ({ ...p, buyerName: e.target.value }))} required className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="buyerPhone" className="text-sm text-[var(--farm-text)]">연락처</Label>
                <Input id="buyerPhone" value={form.buyerPhone} onChange={(e) => setForm((p) => ({ ...p, buyerPhone: e.target.value.replace(/\D/g, "") }))} inputMode="numeric" required className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buyerEmail" className="text-sm text-[var(--farm-text)]">이메일</Label>
              <Input id="buyerEmail" type="email" value={form.buyerEmail} onChange={(e) => setForm((p) => ({ ...p, buyerEmail: e.target.value }))} className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
            </div>
            {!me && (
              <div className="space-y-1.5">
                <Label htmlFor="orderPin" className="text-sm text-[var(--farm-text)]">
                  주문 조회 PIN <span className="text-[var(--destructive)]">*</span>
                </Label>
                <Input
                  id="orderPin"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="숫자 4자리"
                  value={form.orderPin}
                  onChange={(e) => setForm((p) => ({ ...p, orderPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  required
                  className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)] w-32"
                />
                <p className="text-xs text-[var(--farm-muted)]">비회원 주문 조회 시 사용합니다. 꼭 기억해두세요.</p>
              </div>
            )}
          </div>

          {/* 수령자 정보 */}
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--farm-text)]">수령자 정보</h2>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--farm-muted)]">
                <input type="checkbox" checked={sameAsOrderer} onChange={(e) => toggleSameAsOrderer(e.target.checked)} className="w-4 h-4 accent-[var(--farm-olive)]" />
                주문자와 동일
              </label>
            </div>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">이름</Label>
                <Input value={form.receiverName} onChange={(e) => setForm((p) => ({ ...p, receiverName: e.target.value }))} disabled={sameAsOrderer} required className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)] disabled:opacity-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">연락처</Label>
                <Input value={form.receiverPhone} onChange={(e) => setForm((p) => ({ ...p, receiverPhone: e.target.value.replace(/\D/g, "") }))} disabled={sameAsOrderer} inputMode="numeric" required className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)] disabled:opacity-50" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">우편번호</Label>
                <Input value={form.receiverZipcode} readOnly required placeholder="우편번호 검색" className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)]" />
              </div>
              <div className="pt-7">
                <Button type="button" variant="outline" onClick={openPostcodeSearch} className="border-[var(--farm-olive)] text-[var(--farm-olive)] hover:bg-[var(--farm-olive)] hover:!text-white whitespace-nowrap">
                  주소 검색
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[var(--farm-text)]">주소</Label>
              <Input value={form.receiverAddress1} readOnly required placeholder="주소 검색으로 입력" className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[var(--farm-text)]">상세 주소</Label>
              <Input value={form.receiverAddress2} onChange={(e) => setForm((p) => ({ ...p, receiverAddress2: e.target.value }))} required className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[var(--farm-text)]">배송 요청사항</Label>
              <textarea
                rows={3}
                value={form.deliveryRequest}
                onChange={(e) => setForm((p) => ({ ...p, deliveryRequest: e.target.value }))}
                className="w-full rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 py-2 text-sm text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)] resize-none placeholder:text-[var(--farm-muted)]"
                placeholder="문 앞에 놓아주세요 등"
              />
            </div>
          </div>

          {/* 동의 + 결제 버튼은 요약 카드 아래 모바일에서 보임 — 실제 submit은 여기 */}
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-4">
            <input type="checkbox" checked={agreeCancelPolicy} onChange={(e) => setAgreeCancelPolicy(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[var(--farm-olive)] shrink-0" />
            <span className="text-xs text-[var(--farm-muted)] leading-relaxed">
              주문 준비중 이후 환불은 자동 처리되지 않으며, 환불 규정에 따라 고객센터 문의 후 수동 처리됩니다.
            </span>
          </label>

          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

          <Button
            type="submit"
            disabled={isPaying || products.length === 0}
            className="w-full h-12 text-base font-semibold bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white lg:hidden"
          >
            {isPaying ? "결제 진행중..." : `${total.toLocaleString()}원 결제하기`}
          </Button>
        </form>

        {/* 오른쪽: 주문 요약 */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-4">
            <h2 className="font-bold text-[var(--farm-text)]">주문 요약</h2>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--farm-muted)]">
                <span>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-[var(--farm-muted)]">
                <span>배송비</span>
                <span>{shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-[var(--farm-muted)]">50,000원 이상 구매시 무료배송</p>
              )}
            </div>
            <Separator className="bg-[var(--farm-line)]" />
            <div className="flex justify-between font-bold text-[var(--farm-text)]">
              <span>결제 금액</span>
              <span className="text-[var(--farm-fig)]">{total.toLocaleString()}원</span>
            </div>
            <Button
              type="submit"
              form="order-form"
              disabled={isPaying || products.length === 0}
              className="hidden lg:flex w-full h-12 text-base font-semibold bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white"
            >
              {isPaying ? "결제 진행중..." : "결제하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
