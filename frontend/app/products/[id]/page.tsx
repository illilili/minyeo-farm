"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { addGuestCartItem } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Product = {
  id: number;
  name: string;
  price: number;
  status: "ON_SALE" | "SOLD_OUT" | "HIDDEN";
  description?: string;
  thumbnailUrl?: string;
};

type Review = {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
};

type ReviewPage = { content: Review[] };

const statusConfig = {
  ON_SALE:  { label: "판매중",  className: "bg-[var(--farm-olive)] text-white" },
  SOLD_OUT: { label: "품절",   className: "bg-[var(--farm-muted)] text-white" },
  HIDDEN:   { label: "비노출", className: "bg-[var(--farm-fig)] text-white" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewPage>({ content: [] });
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"detail" | "reviews">("detail");

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      apiGet<Product>(`/api/products/${productId}`),
      apiGet<ReviewPage>(`/api/products/${productId}/reviews?page=0&size=10`),
    ])
      .then(([p, r]) => { setProduct(p); setReviews(r); })
      .catch((e: Error) => setLoadError(e.message || "상품 정보를 불러오지 못했습니다."));
  }, [productId]);

  async function addToCart() {
    if (!product) return;
    setActionError(""); setMessage("");
    try {
      if (localStorage.getItem("accessToken")) {
        await apiPost("/api/my/cart", { productId: product.id, quantity });
        setMessage("장바구니에 담겼습니다.");
      } else {
        addGuestCartItem(product.id, quantity);
        setMessage("장바구니에 담겼습니다.");
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "장바구니 담기에 실패했습니다.");
    }
  }

  if (loadError) return <p className="mx-auto max-w-6xl px-4 py-10 text-[var(--destructive)] text-sm">{loadError}</p>;
  if (!product) return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[var(--farm-muted)]">
      <div className="w-8 h-8 border-2 border-[var(--farm-olive)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm">상품 정보를 불러오는 중...</p>
    </div>
  );

  const isSoldOut = product.status === "SOLD_OUT";
  const status = statusConfig[product.status];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      {/* 상품 상단 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 */}
        <div className="rounded-xl overflow-hidden border border-[var(--farm-line)] bg-[var(--farm-beige-soft)]">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.name} className="w-full object-contain max-h-[500px]" />
          ) : (
            <div className="aspect-square flex items-center justify-center text-6xl">🌿</div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-col gap-4">
          <div>
            <Badge className={`mb-2 text-xs ${status.className}`}>{status.label}</Badge>
            <h1 className="text-2xl font-bold text-[var(--farm-text)]">{product.name}</h1>
          </div>

          <Separator className="bg-[var(--farm-line)]" />

          <div>
            <p className="text-3xl font-bold text-[var(--farm-fig)]">
              {product.price.toLocaleString()}원
            </p>
            <p className="text-xs text-[var(--farm-muted)] mt-1">배송비 3,000원 · 50,000원 이상 무료배송</p>
          </div>

          <Separator className="bg-[var(--farm-line)]" />

          {/* 수량 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--farm-text)] w-10">수량</span>
            <div className="flex items-center border border-[var(--farm-line)] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium text-[var(--farm-text)]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-[var(--farm-muted)] hover:bg-[var(--farm-beige-soft)] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* 총 금액 */}
          <div className="flex items-center justify-between rounded-xl bg-[var(--farm-beige-soft)] px-4 py-3">
            <span className="text-sm text-[var(--farm-muted)]">총 상품금액</span>
            <span className="text-lg font-bold text-[var(--farm-fig)]">
              {(product.price * quantity).toLocaleString()}원
            </span>
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={addToCart}
              disabled={isSoldOut}
              className="border-[var(--farm-olive)] text-[var(--farm-olive)] hover:bg-[var(--farm-olive)] !hover:text-white transition-colors h-12 text-base"
            >
              장바구니
            </Button>
            <Button
              onClick={() => router.push(`/order?productId=${product.id}&quantity=${quantity}`)}
              disabled={isSoldOut}
              className="bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white h-12 text-base"
            >
              {isSoldOut ? "품절" : "주문하기"}
            </Button>
          </div>

          {message && <p className="text-sm text-[var(--farm-olive)] font-medium">{message}</p>}
          {actionError && <p className="text-sm text-[var(--destructive)]">{actionError}</p>}
        </div>
      </div>

      {/* 탭 */}
      <div>
        <div className="flex border-b border-[var(--farm-line)]">
          {(["detail", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[var(--farm-olive)] text-[var(--farm-olive)]"
                  : "border-transparent text-[var(--farm-muted)] hover:text-[var(--farm-text)]"
              }`}
            >
              {tab === "detail" ? "상품 상세" : `후기 (${reviews.content.length})`}
            </button>
          ))}
        </div>

        {activeTab === "detail" && (
          <div className="py-6">
            {product.description ? (
              <div
                className="rich-content text-[var(--farm-text)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-[var(--farm-muted)] text-sm py-8 text-center">상품 설명이 아직 등록되지 않았습니다.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="py-6 space-y-4">
            {reviews.content.length === 0 ? (
              <p className="text-[var(--farm-muted)] text-sm text-center py-8">아직 등록된 후기가 없습니다.</p>
            ) : (
              reviews.content.map((review) => (
                <div key={review.id} className="border border-[var(--farm-line)] rounded-xl p-4 bg-[var(--farm-surface)]">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-[var(--farm-muted)]">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--farm-text)] leading-relaxed">{review.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
