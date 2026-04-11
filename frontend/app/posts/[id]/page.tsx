"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: number;
  category: string;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
};

const categoryConfig: Record<string, { label: string; className: string }> = {
  NOTICE:   { label: "공지",   className: "bg-[var(--farm-fig)] text-white" },
  HARVEST:  { label: "수확",   className: "bg-[var(--farm-olive)] text-white" },
  SHIPPING: { label: "배송",   className: "bg-[var(--farm-olive-light)] text-white" },
  RESTOCK:  { label: "재입고", className: "bg-[var(--farm-beige-soft)] text-[var(--farm-text)] border border-[var(--farm-line)]" },
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    apiGet<Post>(`/api/posts/${params.id}`).then(setPost);
  }, [params?.id]);

  if (!post) return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-[var(--farm-muted)]">
      <div className="w-8 h-8 border-2 border-[var(--farm-olive)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm">불러오는 중...</p>
    </div>
  );

  const cat = categoryConfig[post.category] ?? { label: post.category, className: "bg-[var(--farm-beige-soft)] text-[var(--farm-text)]" };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {/* 뒤로가기 */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-sm text-[var(--farm-muted)] hover:text-[var(--farm-olive)] transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        농장 소식 목록
      </Link>

      {/* 헤더 */}
      <div className="mb-6">
        <Badge className={`mb-3 text-xs ${cat.className}`}>{cat.label}</Badge>
        <h1 className="text-2xl font-bold text-[var(--farm-text)] leading-snug">{post.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--farm-muted)]">
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
          <span>·</span>
          <span>조회 {post.viewCount.toLocaleString()}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-[var(--farm-line)] mb-8" />

      {/* 본문 */}
      <div
        className="rich-content text-[var(--farm-text)] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
