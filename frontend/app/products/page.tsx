"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: number;
  name: string;
  price: number;
  status: "ON_SALE" | "SOLD_OUT" | "HIDDEN";
  thumbnailUrl?: string;
};

type ProductPage = { content: Product[] };

const statusConfig = {
  ON_SALE:  { label: "판매중",  className: "bg-[var(--farm-olive)] text-white" },
  SOLD_OUT: { label: "품절",   className: "bg-[var(--farm-muted)] text-white" },
  HIDDEN:   { label: "비노출", className: "bg-[var(--farm-fig)] text-white" },
};

export default function ProductsPage() {
  const [data, setData] = useState<ProductPage>({ content: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<ProductPage>("/api/products?page=0&size=20&sort=createdAt,DESC")
      .then(setData)
      .catch((e: Error) => setError(e.message || "상품 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--farm-text)]">상품 목록</h1>
        <p className="text-sm text-[var(--farm-muted)] mt-1">미녀농장의 제철 농산물을 만나보세요</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] overflow-hidden animate-pulse">
              <div className="h-44 bg-[var(--farm-beige-soft)]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[var(--farm-beige-soft)] rounded w-3/4" />
                <div className="h-4 bg-[var(--farm-beige-soft)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[var(--destructive)] text-sm">{error}</p>
      )}

      {!isLoading && !error && data.content.length === 0 && (
        <div className="text-center py-20 text-[var(--farm-muted)]">
          <p className="text-4xl mb-3">🌱</p>
          <p>등록된 상품이 없습니다.</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.content.map((product) => {
            const status = statusConfig[product.status];
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] overflow-hidden hover:shadow-md hover:border-[var(--farm-olive)] transition-all"
              >
                <div className="relative h-44 bg-[var(--farm-beige-soft)] overflow-hidden">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                  )}
                  {product.status !== "ON_SALE" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{status.label}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-[var(--farm-text)] truncate">{product.name}</p>
                  <p className="text-[var(--farm-fig)] font-bold text-base mt-1">
                    {product.price.toLocaleString()}원
                  </p>
                  <Badge className={`mt-1.5 text-xs px-1.5 py-0 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
