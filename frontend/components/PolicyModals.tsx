"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type PolicyType = "privacy" | "terms" | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-[var(--farm-text)] border-b border-[var(--farm-line)] pb-1.5">{title}</h3>
      <div className="text-xs leading-relaxed text-[var(--farm-text)] space-y-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:text-[var(--farm-muted)]">
        {children}
      </div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border border-[var(--farm-line)] rounded-lg overflow-hidden">
        <thead className="bg-[var(--farm-beige-soft)]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-2 py-1.5 text-left font-semibold text-[var(--farm-text)] border-b border-[var(--farm-line)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--farm-line)] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1.5 text-[var(--farm-muted)]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-[var(--farm-text)]">
      <p className="text-xs leading-relaxed">
        미녀농장(이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고
        관련 고충을 신속히 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <Section title="제1조 처리 목적">
        <ul>
          <li>주문·결제·배송 처리 및 관련 민원 대응</li>
          <li>회원 가입 및 회원제 서비스 제공 (네이버 소셜 로그인)</li>
          <li>구매 후기 작성 및 서비스 품질 개선</li>
        </ul>
      </Section>

      <Section title="제2조 처리하는 개인정보 항목">
        <Table
          headers={["구분", "수집 항목", "수집 방법"]}
          rows={[
            ["회원", "이름, 이메일, 연락처 (네이버 제공)", "소셜 로그인"],
            ["비회원 주문", "주문자명, 연락처, 이메일, 배송지, 주문조회 PIN", "주문 입력"],
            ["결제", "결제수단 정보 (토스페이먼츠 위탁, 당사 미보관)", "결제 대행"],
            ["자동 수집", "접속 IP, 브라우저 정보, 서비스 이용 기록", "시스템 자동"],
          ]}
        />
      </Section>

      <Section title="제3조 보유 기간">
        <Table
          headers={["목적", "보유 기간"]}
          rows={[
            ["회원 정보", "회원 탈퇴 시까지"],
            ["주문·결제 기록", "5년 (전자상거래법 제6조)"],
            ["소비자 불만·분쟁 기록", "3년 (전자상거래법 제6조)"],
            ["표시·광고 기록", "6개월 (전자상거래법 제6조)"],
          ]}
        />
      </Section>

      <Section title="제4조 제3자 제공">
        <p>원칙적으로 외부에 제공하지 않습니다. 단, 배송 처리를 위해 택배사에 수령인명·연락처·배송지를 제공하며, 배송 완료 후 즉시 파기합니다.</p>
      </Section>

      <Section title="제5조 처리 위탁">
        <Table
          headers={["수탁업체", "위탁 업무"]}
          rows={[
            ["토스페이먼츠(주)", "결제 처리 및 민원 대응"],
            ["Amazon Web Services Inc.", "서버 운영 및 이미지 저장 (S3)"],
            ["네이버클라우드(주)", "소셜 로그인 인증 처리"],
          ]}
        />
      </Section>

      <Section title="제6조 정보주체의 권리">
        <p>열람·정정·삭제·처리정지 요구 권리를 가지며, 개인정보 보호책임자에게 이메일 또는 서면으로 요청 시 지체 없이 처리합니다.</p>
      </Section>

      <Section title="제7조 개인정보 보호책임자">
        <p>성명: 홍길동 &nbsp;|&nbsp; 연락처: 010-1111-1111 &nbsp;|&nbsp; 이메일: help@minyeofarm.kr</p>
        <p className="text-[var(--farm-muted)]">
          개인정보 침해 신고: 개인정보침해신고센터 118 / 경찰청 사이버안전국 182
        </p>
      </Section>

      <p className="text-xs text-[var(--farm-muted)]">시행일: 2026년 1월 1일</p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6 text-[var(--farm-text)]">
      <Section title="제1조 목적">
        <p>이 약관은 미녀농장(이하 "회사")이 운영하는 인터넷 쇼핑몰 서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무를 규정합니다.</p>
      </Section>

      <Section title="제2조 약관의 효력 및 변경">
        <p>약관은 서비스 초기 화면에 게시하여 효력이 발생합니다. 변경 시 시행 7일 전(이용자에게 불리한 변경은 30일 전) 공지합니다.</p>
      </Section>

      <Section title="제3조 주문 및 결제">
        <ul>
          <li>결제는 토스페이먼츠를 통한 신용카드 등 전자적 방법을 사용합니다.</li>
          <li>비회원 주문 시 주문조회 PIN(4자리)을 설정하며, 분실 시 고객센터를 통해 본인 확인 후 처리합니다.</li>
          <li>농산물 특성상 수확 상황에 따라 품절 시 주문이 취소되고 전액 환불됩니다.</li>
        </ul>
      </Section>

      <Section title="제4조 배송">
        <ul>
          <li>결제 확인 후 영업일 기준 1–3일 내 출고를 원칙으로 합니다. 수확 일정에 따라 변동될 수 있습니다.</li>
          <li>배송비: 5만 원 이상 무료, 미만 3,000원</li>
        </ul>
      </Section>

      <Section title="제5조 청약철회 및 환불">
        <p>「전자상거래법」 제17조에 따라 상품 수령일로부터 7일 이내 청약철회가 가능합니다. 단, 다음의 경우 제한됩니다.</p>
        <ul>
          <li>신선식품(무화과·고구마 등) 특성상 시간이 지나면 재판매가 곤란한 상품 (동법 제17조 제2항 제3호)</li>
          <li>이용자 귀책사유로 상품이 훼손된 경우</li>
        </ul>
        <p className="font-medium text-[var(--farm-fig)]">주문 준비 이후(상품 준비중 상태)에는 자동 취소가 불가하며, 고객센터(010-1111-1111) 문의 후 처리됩니다.</p>
        <p>단순 변심 반품의 왕복 배송비는 이용자 부담입니다.</p>
      </Section>

      <Section title="제6조 면책">
        <ul>
          <li>천재지변 등 불가항력적 사유로 서비스 제공이 불가한 경우 책임이 면제됩니다.</li>
          <li>이용자의 귀책사유로 발생한 손해에 대해 회사는 책임을 지지 않습니다.</li>
        </ul>
      </Section>

      <Section title="제7조 분쟁 해결">
        <p>협의가 이루어지지 않는 경우 공정거래위원회 또는 분쟁조정기구에 조정을 신청할 수 있습니다. 소송이 제기될 경우 회사 소재지 관할 법원을 관할 법원으로 합니다.</p>
      </Section>

      <p className="text-xs text-[var(--farm-muted)]">시행일: 2026년 1월 1일</p>
    </div>
  );
}

export default function PolicyModals() {
  const [open, setOpen] = useState<PolicyType>(null);

  return (
    <>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setOpen("privacy")}
          className="text-xs text-[var(--farm-muted)] hover:text-[var(--farm-text)] underline-offset-4 hover:underline transition-colors"
        >
          개인정보처리방침
        </button>
        <button
          type="button"
          onClick={() => setOpen("terms")}
          className="text-xs text-[var(--farm-muted)] hover:text-[var(--farm-text)] underline-offset-4 hover:underline transition-colors"
        >
          이용약관
        </button>
      </div>

      <Dialog open={open === "privacy"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl flex flex-col overflow-hidden p-0 max-h-[85vh] bg-[var(--farm-surface)] border-[var(--farm-line)]">
          <div className="shrink-0 px-6 py-4 border-b border-[var(--farm-line)]">
            <DialogTitle className="text-[var(--farm-text)]">개인정보처리방침</DialogTitle>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <PrivacyContent />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "terms"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl flex flex-col overflow-hidden p-0 max-h-[85vh] bg-[var(--farm-surface)] border-[var(--farm-line)]">
          <div className="shrink-0 px-6 py-4 border-b border-[var(--farm-line)]">
            <DialogTitle className="text-[var(--farm-text)]">이용약관</DialogTitle>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <TermsContent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
