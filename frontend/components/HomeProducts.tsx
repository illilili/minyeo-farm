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

  useEffect(() => {
    // 서버에서 관리자가 지정한 홈 표시 상품 조회
    apiGet<Product[]>("/api/products/featured")
      .then((featured) => {
        if (featured.length > 0) {
          setProducts(featured.slice(0, 3));
        } else {
          // featured 없으면 최신 상품 3개 폴백
          apiGet<ProductPage>("/api/products?page=0&size=3&sort=createdAt,DESC")
            .then((data) => setProducts(data.content))
            .catch(() => setProducts([]));
        }
      })
      .catch(() => {
        apiGet<ProductPage>("/api/products?page=0&size=3&sort=createdAt,DESC")
          .then((data) => setProducts(data.content))
          .catch(() => setProducts([]));
      });
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
