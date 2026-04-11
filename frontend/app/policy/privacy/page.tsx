export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10 text-[var(--farm-text)]">
      <div>
        <h1 className="text-2xl font-bold mb-2">개인정보처리방침</h1>
        <p className="text-sm text-[var(--farm-muted)]">시행일: 2026년 1월 1일</p>
      </div>

      <p className="text-sm leading-relaxed">
        미녀농장(이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한
        고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <Section title="제1조 개인정보의 처리 목적">
        <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음 목적 이외의 용도로는 이용되지 않으며, 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
        <ul>
          <li>주문·결제·배송 처리 및 관련 민원 대응</li>
          <li>회원 가입 및 회원제 서비스 제공 (네이버 소셜 로그인)</li>
          <li>구매 후기 작성 및 서비스 품질 개선</li>
        </ul>
      </Section>

      <Section title="제2조 처리하는 개인정보의 항목">
        <Table
          headers={["구분", "수집 항목", "수집 방법"]}
          rows={[
            ["회원", "이름, 이메일, 연락처 (네이버 제공)", "소셜 로그인"],
            ["비회원 주문", "주문자명, 연락처, 이메일, 배송지(우편번호·주소), 주문조회 PIN", "주문 입력"],
            ["결제", "결제수단 정보 (토스페이먼츠 위탁 처리, 당사 미보관)", "결제 대행"],
            ["자동 수집", "접속 IP, 브라우저 정보, 서비스 이용 기록", "시스템 자동 수집"],
          ]}
        />
      </Section>

      <Section title="제3조 개인정보의 처리 및 보유 기간">
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

      <Section title="제4조 개인정보의 제3자 제공">
        <p>회사는 정보주체의 개인정보를 처리 목적 범위 내에서만 사용하며, 원칙적으로 외부에 제공하지 않습니다. 다만, 다음 경우는 예외로 합니다.</p>
        <ul>
          <li>정보주체가 사전에 동의한 경우</li>
          <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>
        <Table
          headers={["제공 받는 자", "제공 목적", "제공 항목", "보유 기간"]}
          rows={[
            ["택배사 (CJ대한통운 등)", "배송 처리", "수령인명, 연락처, 배송지", "배송 완료 후 즉시 파기"],
          ]}
        />
      </Section>

      <Section title="제5조 개인정보 처리 위탁">
        <Table
          headers={["수탁업체", "위탁 업무"]}
          rows={[
            ["토스페이먼츠(주)", "결제 처리 및 결제 관련 민원 대응"],
            ["Amazon Web Services Inc.", "서버 운영 및 이미지 파일 저장 (S3)"],
            ["네이버클라우드(주)", "소셜 로그인 인증 처리"],
          ]}
        />
        <p>위탁 계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한 등을 규정하고 있습니다.</p>
      </Section>

      <Section title="제6조 정보주체의 권리·의무 및 행사 방법">
        <p>정보주체는 회사에 대해 언제든지 다음 각 호의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 처리 현황 열람 요구</li>
          <li>오류 등이 있을 경우 정정 요구</li>
          <li>삭제 요구 (단, 법령에서 수집이 의무화된 경우 제외)</li>
          <li>처리 정지 요구</li>
        </ul>
        <p>권리 행사는 개인정보 보호책임자에게 이메일 또는 서면으로 요청하시면 지체 없이 처리합니다.</p>
      </Section>

      <Section title="제7조 개인정보의 안전성 확보 조치">
        <ul>
          <li>관리적 조치: 개인정보 취급 직원 최소화 및 교육</li>
          <li>기술적 조치: 개인정보 접근 제한, 비밀번호 암호화(BCrypt), HTTPS 통신</li>
          <li>물리적 조치: 전산실 및 자료보관실 접근 통제</li>
        </ul>
      </Section>

      <Section title="제8조 개인정보 보호책임자">
        <Table
          headers={["항목", "내용"]}
          rows={[
            ["성명", "홍길동"],
            ["직책", "대표"],
            ["연락처", "010-1111-1111"],
            ["이메일", "help@minyeofarm.kr"],
          ]}
        />
        <p>개인정보 침해에 관한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.</p>
        <ul>
          <li>개인정보 침해신고센터: privacy.kisa.or.kr / 국번없이 118</li>
          <li>대검찰청 사이버수사과: www.spo.go.kr / 국번없이 1301</li>
          <li>경찰청 사이버안전국: cyberbureau.police.go.kr / 국번없이 182</li>
        </ul>
      </Section>

      <Section title="제9조 개인정보처리방침 변경">
        <p>이 개인정보처리방침은 2026년 1월 1일부터 적용됩니다. 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 경우 변경사항 시행 7일 전부터 웹사이트 공지사항을 통해 고지합니다.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-[var(--farm-text)] border-b border-[var(--farm-line)] pb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-[var(--farm-text)] space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-[var(--farm-muted)]">
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
              <th key={h} className="px-3 py-2 text-left font-semibold text-[var(--farm-text)] border-b border-[var(--farm-line)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--farm-line)] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-[var(--farm-muted)]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
