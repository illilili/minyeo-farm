import Link from "next/link";
import { Button } from "@/components/ui/button";
import HomeProducts from "@/components/HomeProducts";

export default function HomePage() {
  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[480px] sm:h-[560px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://minyeo-farm.s3.ap-northeast-2.amazonaws.com/public/products/%EB%AC%B4%ED%99%94%EA%B3%BC+%EB%86%8D%EC%9E%A5+%EC%8D%B8%EB%84%A4%EC%9D%BC.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="relative h-full flex items-center">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
              <div className="max-w-md">
                <p className="text-white/70 text-sm font-medium mb-3 tracking-widest uppercase">
                  산지직송 제철 농산물
                </p>
                <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  오늘 수확한
                  <br />
                  <span style={{ color: "#c8d89a" }}>미녀농장</span>의 신선함
                </h1>
                <p className="text-white/80 text-base mb-8 leading-relaxed">
                  무화과·고구마를 제철에 맞춰 정성껏 키워
                  <br className="hidden sm:block" />
                  산지에서 바로 보내드립니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--farm-fig)] hover:bg-[var(--farm-fig-dark)] !text-white font-medium shadow-lg"
                  >
                    <Link href="/products">상품 보러가기</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="border border-white/60 !text-white bg-white/20 hover:bg-white/35 backdrop-blur-sm shadow-md font-medium"
                  >
                    <Link href="/posts">농장 소식</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 배너 */}
      <section className="bg-[var(--farm-olive)] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {[
              { icon: "🌱", title: "산지직송", desc: "농장에서 바로" },
              { icon: "📦", title: "꼼꼼한 선별", desc: "품질 보장 출고" },
              { icon: "🍂", title: "제철 수확", desc: "가장 맛있을 때" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 px-2 sm:px-4 text-center sm:text-left"
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-white/70 text-xs hidden sm:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 상품 바로가기 */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[var(--farm-muted)] text-sm mb-1">지금 판매중</p>
            <h2 className="text-2xl font-bold text-[var(--farm-text)]">농장 상품</h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-[var(--farm-olive)] hover:text-[var(--farm-olive-light)] font-medium flex items-center gap-1 transition-colors"
          >
            전체보기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <HomeProducts />
      </section>

      {/* 농장 소식 CTA */}
      <section className="bg-[var(--farm-beige-soft)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[var(--farm-muted)] text-sm mb-1">농장의 이야기</p>
            <h2 className="text-xl font-bold text-[var(--farm-text)]">
              수확 소식·출고 안내를 확인하세요
            </h2>
          </div>
          <Button
            asChild
            className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] !text-white shrink-0"
          >
            <Link href="/posts">농장 소식 보기</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
