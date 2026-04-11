"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  price: number;
  status: "ON_SALE" | "SOLD_OUT" | "HIDDEN";
  thumbnailUrl?: string;
};

type ProductPage = { content: Product[] };

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] overflow-hidden hover:shadow-md hover:border-[var(--farm-olive)] transition-all"
    >
      <div className="bg-[var(--farm-beige-soft)] aspect-square overflow-hidden">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-[var(--farm-text)] truncate">{product.name}</p>
        <p className="text-[var(--farm-fig)] font-semibold text-sm mt-0.5">{product.price.toLocaleString()}원</p>
      </div>
    </Link>
  );
}

export default function HomeProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("featuredProductIds");
      if (stored) setFeaturedIds(JSON.parse(stored) as number[]);
    } catch { /* ignore */ }

    apiGet<ProductPage>("/api/products?page=0&size=20&sort=createdAt,DESC")
      .then((data) => setProducts(data.content))
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded-xl bg-[var(--farm-beige-soft)] animate-pulse" />
        ))}
      </div>
    );
  }

  // 지정된 상품 순서대로, 없으면 최신순으로 최대 3개
  const featured = featuredIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  const displayed = featured.length > 0
    ? featured.slice(0, 3)
    : products.slice(0, 3);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {displayed.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
