"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import AdminTabs from "@/components/AdminTabs";
import RichEditor from "@/components/RichEditor";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUploadImage } from "@/lib/api";
import { toProductStatusLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type ProductStatus = "ON_SALE" | "SOLD_OUT" | "HIDDEN";

type Product = {
  id: number;
  name: string;
  price: number;
  status: ProductStatus;
  thumbnailUrl?: string;
  description?: string;
  featured?: boolean;
};

type ProductForm = {
  name: string;
  price: string;
  status: ProductStatus;
  thumbnailUrl: string;
  description: string;
};

const initialForm: ProductForm = { name: "", price: "", status: "ON_SALE", thumbnailUrl: "", description: "" };

const STATUS_CONFIG: Record<ProductStatus, { label: string; badge: string; dot: string }> = {
  ON_SALE:  { label: "판매중",  badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  SOLD_OUT: { label: "품절",    badge: "bg-gray-100 text-gray-500",   dot: "bg-gray-400" },
  HIDDEN:   { label: "비노출",  badge: "bg-red-100 text-red-500",     dot: "bg-red-400"  },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const MAX_FEATURED = 3;

  async function refresh() {
    const data = await apiGet<Product[]>("/api/admin/products");
    setProducts(data);
    setFeaturedIds(data.filter((p) => p.featured).map((p) => p.id));
  }

  useEffect(() => {
    refresh().catch((e: Error) => setError(e.message));
  }, []);

  function updateFeaturedIds(products: Product[]) {
    setFeaturedIds(products.filter((p) => p.featured).map((p) => p.id));
  }

  async function toggleFeatured(id: number) {
    setMessage(""); setError("");
    try {
      await apiPatch(`/api/admin/products/${id}/featured`, {});
      const data = await apiGet<Product[]>("/api/admin/products");
      setProducts(data);
      updateFeaturedIds(data);
      setMessage(featuredIds.includes(id) ? "홈 표시에서 제거했습니다." : "홈에 표시할 상품으로 추가했습니다.");
    } catch (e) { setError(e instanceof Error ? e.message : "홈 표시 변경에 실패했습니다."); }
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({ name: product.name, price: String(product.price), status: product.status, thumbnailUrl: product.thumbnailUrl ?? "", description: product.description ?? "" });
    setShowForm(true);
    setMessage(""); setError("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function resetForm() { setEditing(null); setForm(initialForm); setShowForm(false); }

  async function uploadThumbnail(file: File) {
    setThumbnailUploading(true); setError("");
    try {
      const { url } = await apiUploadImage("/api/admin/media/upload", file);
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      setMessage("썸네일이 업로드되었습니다.");
    } catch (e) { setError(e instanceof Error ? e.message : "썸네일 업로드에 실패했습니다."); }
    finally { setThumbnailUploading(false); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      const payload = { name: form.name.trim(), price: Number(form.price), status: form.status, thumbnailUrl: form.thumbnailUrl.trim() || null, description: form.description.trim() || null };
      if (editing) { await apiPut(`/api/admin/products/${editing.id}`, payload); setMessage("상품이 수정되었습니다."); }
      else { await apiPost("/api/admin/products", payload); setMessage("상품이 등록되었습니다."); }
      resetForm();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "상품 저장에 실패했습니다."); }
  }

  async function changeStatus(id: number, status: ProductStatus, msg: string) {
    setMessage(""); setError("");
    try { await apiPatch(`/api/admin/products/${id}/status`, { status }); setMessage(msg); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "상태 변경에 실패했습니다."); }
  }

  async function deleteProduct(id: number) {
    if (!confirm("이 상품을 숨김 처리할까요?")) return;
    setMessage(""); setError("");
    try {
      await apiDelete(`/api/admin/products/${id}`);
      setMessage("숨김 처리했습니다.");
      if (editing?.id === id) resetForm();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "숨김 처리에 실패했습니다."); }
  }

  const visibleProducts = products.filter((p) => p.status !== "HIDDEN");
  const hiddenProducts  = products.filter((p) => p.status === "HIDDEN");
  const featuredCount   = featuredIds.length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--farm-text)]">상품 관리</h1>
          <Button
            type="button"
            onClick={() => { setEditing(null); setForm(initialForm); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
            className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white"
          >
            + 새 상품 추가
          </Button>
        </div>
        <AdminTabs />
      </div>

      {message && <p className="text-sm text-[var(--farm-olive)] font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{message}</p>}
      {error   && <p className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>}

      {/* 상품 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* 홈 표시 슬롯 안내 */}
        <div className="col-span-2 sm:col-span-3 flex items-center gap-2 text-sm text-[var(--farm-muted)]">
          <span>홈 화면 표시:</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 ${i < featuredCount ? "border-[var(--farm-olive)] bg-[var(--farm-olive)]" : "border-[var(--farm-line)]"}`} />
            ))}
          </div>
          <span>{featuredCount}/{MAX_FEATURED}개 선택됨</span>
        </div>

        {visibleProducts.map((product) => {
          const cfg = STATUS_CONFIG[product.status];
          const isFeatured = featuredIds.includes(product.id);
          const canAddFeatured = !isFeatured && featuredCount < MAX_FEATURED;
          return (
            <div
              key={product.id}
              className={`rounded-xl border bg-[var(--farm-surface)] overflow-hidden group transition-shadow hover:shadow-md ${
                isFeatured ? "border-[var(--farm-olive)] ring-1 ring-[var(--farm-olive)]" : "border-[var(--farm-line)]"
              }`}
            >
              {/* 썸네일 */}
              <div className="relative bg-[var(--farm-beige-soft)] aspect-square overflow-hidden">
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
                )}
                {isFeatured && (
                  <span className="absolute top-2 left-2 bg-[var(--farm-olive)] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    홈 표시 {featuredIds.indexOf(product.id) + 1}
                  </span>
                )}
                <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {/* 정보 */}
              <div className="p-3 space-y-2.5">
                <div>
                  <p className="font-bold text-sm text-[var(--farm-text)]">{product.name}</p>
                  <p className="text-[var(--farm-fig)] font-semibold text-sm mt-0.5">{product.price.toLocaleString()}원</p>
                </div>

                {/* 홈 표시 버튼 */}
                <Button
                  type="button"
                  size="sm"
                  variant={isFeatured ? "default" : "outline"}
                  onClick={() => toggleFeatured(product.id)}
                  disabled={!isFeatured && !canAddFeatured}
                  className={`w-full text-xs h-8 ${
                    isFeatured
                      ? "bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white"
                      : canAddFeatured
                      ? "border-[var(--farm-olive)] text-[var(--farm-olive)]"
                      : "border-[var(--farm-line)] text-[var(--farm-muted)] opacity-50"
                  }`}
                >
                  {isFeatured ? "✓ 홈에 표시 중 (클릭해서 제거)" : canAddFeatured ? "홈에 추가" : "홈 표시 꽉 참"}
                </Button>

                {/* 수정 / 품절 / 숨김 */}
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(product)} className="flex-1 text-xs border-[var(--farm-olive)] text-[var(--farm-olive)] h-7">
                    수정
                  </Button>
                  {product.status === "SOLD_OUT" ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => changeStatus(product.id, "ON_SALE", "판매 재개했습니다.")} className="flex-1 text-xs h-7 border-green-400 text-green-700">
                      재개
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" onClick={() => changeStatus(product.id, "SOLD_OUT", "품절 처리했습니다.")} className="flex-1 text-xs h-7 border-[var(--farm-line)] text-[var(--farm-muted)]">
                      품절
                    </Button>
                  )}
                  <Button type="button" size="sm" variant="outline" onClick={() => deleteProduct(product.id)} className="flex-1 text-xs h-7 border-[var(--destructive)] text-[var(--destructive)]">
                    숨김
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 숨김 상품 목록 (접이식) */}
      {hiddenProducts.length > 0 && (
        <details className="rounded-xl border border-[var(--farm-line)] overflow-hidden">
          <summary className="px-4 py-3 text-sm text-[var(--farm-muted)] cursor-pointer hover:bg-[var(--farm-beige-soft)] select-none">
            숨김 처리된 상품 {hiddenProducts.length}개
          </summary>
          <div className="divide-y divide-[var(--farm-line)]">
            {hiddenProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--farm-surface)]">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--farm-beige-soft)] shrink-0">
                  {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🌿</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--farm-muted)] truncate">{product.name}</p>
                  <p className="text-xs text-[var(--farm-muted)]">{product.price.toLocaleString()}원</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => changeStatus(product.id, "ON_SALE", "숨김을 해제했습니다.")} className="text-xs border-[var(--farm-olive)] text-[var(--farm-olive)] shrink-0">
                  숨김 해제
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 상품 등록/수정 폼 */}
      {showForm && (
        <div ref={formRef} className="rounded-xl border-2 border-[var(--farm-olive)] bg-[var(--farm-surface)] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[var(--farm-text)]">{editing ? `"${editing.name}" 수정` : "새 상품 추가"}</h2>
            <button type="button" onClick={resetForm} className="text-[var(--farm-muted)] hover:text-[var(--farm-text)] text-xl leading-none">✕</button>
          </div>
          <Separator className="bg-[var(--farm-line)]" />

          <form onSubmit={saveProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">상품명</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="예: 미녀농장 무화과" className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">가격 (원)</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required placeholder="0" className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">판매 상태</Label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))} className="w-full h-10 rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 text-sm text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)]">
                  <option value="ON_SALE">판매중</option>
                  <option value="SOLD_OUT">품절</option>
                  <option value="HIDDEN">비노출</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[var(--farm-text)]">썸네일 이미지</Label>
                <input type="file" accept="image/*" disabled={thumbnailUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadThumbnail(f); }} className="block w-full text-xs text-[var(--farm-muted)] file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[var(--farm-olive)] file:text-white hover:file:bg-[var(--farm-olive-light)] disabled:opacity-50 cursor-pointer" />
                {thumbnailUploading && <p className="text-xs text-[var(--farm-muted)]">업로드중...</p>}
              </div>
            </div>

            {form.thumbnailUrl && (
              <div className="flex items-start gap-3">
                <img src={form.thumbnailUrl} alt="미리보기" className="w-20 h-20 rounded-lg object-cover border border-[var(--farm-line)]" />
                <p className="text-xs text-[var(--farm-muted)] break-all mt-1">{form.thumbnailUrl}</p>
              </div>
            )}

            <RichEditor label="상품 설명" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="상품 특징, 원산지, 보관 방법 등을 작성하세요." />

            <div className="flex gap-3 pt-1">
              <Button type="submit" className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white">
                {editing ? "수정 저장" : "상품 등록"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="border-[var(--farm-line)] text-[var(--farm-muted)]">취소</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
