"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ModalType = "privacy" | "terms" | null;

export default function FooterLegalModals() {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <>
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setOpenModal("privacy")}
          className="text-sm text-[var(--farm-muted)] hover:text-[var(--farm-text)] underline-offset-4 hover:underline transition-colors"
        >
          개인정보처리방침
        </button>
        <button
          type="button"
          onClick={() => setOpenModal("terms")}
          className="text-sm text-[var(--farm-muted)] hover:text-[var(--farm-text)] underline-offset-4 hover:underline transition-colors"
        >
          이용약관
        </button>
      </div>

      <Sheet open={openModal === "privacy"} onOpenChange={(v) => !v && setOpenModal(null)}>
        <SheetContent className="bg-[var(--farm-surface)] border-[var(--farm-line)]">
          <SheetHeader>
            <SheetTitle className="text-[var(--farm-text)]">개인정보처리방침</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm text-[var(--farm-text)] leading-relaxed">
            <p>미녀농장은 주문 처리와 배송을 위해 최소한의 개인정보를 수집 및 이용합니다.</p>
            <p className="text-[var(--farm-muted)]">
              수집 항목: 이름, 연락처, 배송지, 결제 관련 정보(결제대행사 연동 데이터 포함)
            </p>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setOpenModal(null)}
              className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] text-white"
            >
              확인
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={openModal === "terms"} onOpenChange={(v) => !v && setOpenModal(null)}>
        <SheetContent className="bg-[var(--farm-surface)] border-[var(--farm-line)]">
          <SheetHeader>
            <SheetTitle className="text-[var(--farm-text)]">이용약관</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm text-[var(--farm-text)] leading-relaxed">
            <p>농산물 특성상 수확 상황에 따라 일부 주문이 취소될 수 있습니다.</p>
            <p className="text-[var(--farm-muted)]">
              주문·결제 이후에도 품질 및 재고 사정에 따라 부분 환불 또는 주문 취소가 안내될 수 있습니다.
            </p>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setOpenModal(null)}
              className="bg-[var(--farm-olive)] hover:bg-[var(--farm-olive-light)] text-white"
            >
              확인
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
