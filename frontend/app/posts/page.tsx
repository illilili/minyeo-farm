"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: number;
  category: string;
  title: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
};
type PostPage = { content: Post[] };

const categoryConfig: Record<string, { label: string; className: string }> = {
  NOTICE:   { label: "공지",   className: "bg-[#b85c38] text-white" },
  HARVEST:  { label: "수확",   className: "bg-[#c4872a] text-white" },
  SHIPPING: { label: "배송",   className: "bg-[#4a7a8a] text-white" },
  RESTOCK:  { label: "재입고", className: "bg-[#7a9a52] text-white" },
};

export default function PostsPage() {
  const [posts, setPosts] = useState<PostPage>({ content: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<PostPage>("/api/posts?page=0&size=20")
      .then(setPosts)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--farm-text)]">농장 소식</h1>
        <p className="text-sm text-[var(--farm-muted)] mt-1">수확·배송·재입고 일정을 공유합니다</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && posts.content.length === 0 && (
        <div className="text-center py-20 text-[var(--farm-muted)]">
          <p className="text-4xl mb-3">📭</p>
          <p>등록된 소식이 없습니다.</p>
        </div>
      )}

      {!isLoading && (
        <div className="rounded-xl border border-[var(--farm-line)] bg-[var(--farm-surface)] overflow-hidden divide-y divide-[var(--farm-line)]">
          {posts.content.map((post) => {
            const cat = categoryConfig[post.category] ?? { label: post.category, className: "bg-[var(--farm-beige-soft)] text-[var(--farm-text)]" };
            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--farm-beige-soft)] transition-colors"
              >
                <Badge className={`shrink-0 text-xs ${cat.className}`}>{cat.label}</Badge>
                <span className="flex-1 font-medium text-sm text-[var(--farm-text)] truncate">
                  {post.title}
                </span>
                <span className="shrink-0 text-xs text-[var(--farm-muted)] hidden sm:block">
                  {post.authorName}
                </span>
                <span className="shrink-0 text-xs text-[var(--farm-muted)]">
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <span className="shrink-0 text-xs text-[var(--farm-muted)] hidden sm:block">
                  조회 {post.viewCount.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
