"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminTabs from "@/components/AdminTabs";
import RichEditor from "@/components/RichEditor";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type PostCategory = "NOTICE" | "HARVEST" | "SHIPPING" | "RESTOCK";

type Post = {
  id: number;
  category: PostCategory;
  title: string;
  content: string;
  createdAt: string;
  published?: boolean;
};

type PostForm = {
  category: PostCategory;
  title: string;
  content: string;
  published: boolean;
};

const initialForm: PostForm = { category: "NOTICE", title: "", content: "", published: true };

const CATEGORY_LABELS: Record<PostCategory, string> = {
  NOTICE: "공지", HARVEST: "수확", SHIPPING: "배송", RESTOCK: "재입고",
};

const CATEGORY_COLOR: Record<PostCategory, string> = {
  NOTICE:  "bg-[#b85c38] text-white",
  HARVEST: "bg-[#c4872a] text-white",
  SHIPPING: "bg-[#4a7a8a] text-white",
  RESTOCK: "bg-[#7a9a52] text-white",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<PostForm>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const data = await apiGet<Post[]>("/api/admin/posts");
    setPosts(data);
  }

  useEffect(() => { refresh().catch((e: Error) => setError(e.message)); }, []);

  function startEdit(post: Post) {
    setEditing(post);
    setForm({ category: post.category, title: post.title, content: post.content, published: post.published ?? true });
    setMessage(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() { setEditing(null); setForm(initialForm); }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      const payload = { category: form.category, title: form.title.trim(), content: form.content.trim(), published: form.published };
      if (editing) { await apiPut(`/api/admin/posts/${editing.id}`, payload); setMessage("소식이 수정되었습니다."); }
      else { await apiPost("/api/admin/posts", payload); setMessage("소식이 등록되었습니다."); }
      resetForm();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "소식 저장에 실패했습니다."); }
  }

  async function deletePost(id: number) {
    if (!confirm("이 소식을 삭제할까요?")) return;
    setMessage(""); setError("");
    try {
      await apiDelete(`/api/admin/posts/${id}`);
      setMessage("소식이 삭제되었습니다.");
      if (editing?.id === id) resetForm();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "소식 삭제에 실패했습니다."); }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--farm-text)]">소식 관리</h1>
        <AdminTabs />
      </div>

      {message && <p className="text-sm text-[var(--farm-olive)] font-medium">{message}</p>}
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

      {/* 소식 등록/수정 폼 */}
      <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-5">
        <h2 className="font-bold text-[var(--farm-text)]">{editing ? "소식 수정" : "소식 추가"}</h2>
        <Separator className="bg-[var(--farm-line)]" />
        <form onSubmit={savePost} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[var(--farm-text)]">카테고리</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as PostCategory }))}
                className="w-full h-10 rounded-lg border border-[var(--farm-line)] bg-[var(--farm-beige-soft)] px-3 text-sm text-[var(--farm-text)] outline-none focus:ring-2 focus:ring-[var(--farm-olive)]"
              >
                <option value="NOTICE">공지</option>
                <option value="HARVEST">수확</option>
                <option value="SHIPPING">배송</option>
                <option value="RESTOCK">재입고</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--farm-text)]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 accent-[var(--farm-olive)]"
                />
                공개 상태
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-[var(--farm-text)]">제목</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              placeholder="소식 제목을 입력하세요"
              className="border-[var(--farm-line)] bg-[var(--farm-beige-soft)] focus-visible:ring-[var(--farm-olive)]"
            />
          </div>

          <RichEditor
            label="내용"
            value={form.content}
            onChange={(next) => setForm((prev) => ({ ...prev, content: next }))}
            placeholder="이번 주 농장 소식을 작성하세요."
          />

          <div className="flex gap-3">
            <Button type="submit" className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white">
              {editing ? "수정 저장" : "소식 등록"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm} className="border-[var(--farm-line)] text-[var(--farm-muted)]">
                취소
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 소식 목록 */}
      <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] p-5 space-y-3">
        <h2 className="font-bold text-[var(--farm-text)]">소식 목록</h2>
        <Separator className="bg-[var(--farm-line)]" />
        {posts.length === 0 && <p className="text-sm text-[var(--farm-muted)] py-4 text-center">등록된 소식이 없습니다.</p>}
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--farm-line)]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${CATEGORY_COLOR[post.category]}`}>{CATEGORY_LABELS[post.category]}</span>
                  <p className="font-medium text-sm text-[var(--farm-text)] truncate">{post.title}</p>
                  {!post.published && <span className="text-xs text-[var(--farm-muted)] shrink-0">(비공개)</span>}
                </div>
                <p className="text-xs text-[var(--farm-muted)] mt-0.5">{new Date(post.createdAt).toLocaleString("ko-KR")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => startEdit(post)} className="text-xs border-[var(--farm-olive)] text-[var(--farm-olive)]">
                  수정
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => deletePost(post.id)} className="text-xs border-[var(--destructive)] text-[var(--destructive)]">
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
