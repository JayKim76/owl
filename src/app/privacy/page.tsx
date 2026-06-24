import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/register" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft size={16} />
            가입 페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-white">개인정보처리방침</h1>
          <p className="text-slate-500 text-sm mt-2">시행일: 2025년 1월 1일 · 최종 수정: 2025년 1월 1일</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 mb-8">
          <p className="text-emerald-300 text-sm leading-6">
            부엉이누수탐지랩(이하 &ldquo;회사&rdquo;)은 「개인정보보호법」 제30조에 따라 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제1조 (개인정보의 처리 목적)</h2>
            <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음 목적 이외의 용도로는 이용되지 않으며, 목적이 변경되는 경우에는 별도의 동의를 받을 예정입니다.</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>서비스 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 서비스 부정이용 방지</li>
              <li>서비스 제공: CRM 기능 제공, 견적서 생성, 고객 관리, 작업 일지 관리</li>
              <li>고객 지원: 서비스 이용 문의 답변, 불만 처리</li>
              <li>서비스 개선: 신규 서비스 개발 및 맞춤 서비스 제공, 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제2조 (처리하는 개인정보의 항목)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-slate-200 font-medium mb-2">① 필수 수집 항목</h3>
                <ul className="space-y-1 list-disc list-inside text-slate-400">
                  <li>업체명, 대표자명</li>
                  <li>연락처(휴대폰 번호)</li>
                  <li>비밀번호(암호화 저장)</li>
                  <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                </ul>
              </div>
              <div>
                <h3 className="text-slate-200 font-medium mb-2">② 선택 수집 항목</h3>
                <ul className="space-y-1 list-disc list-inside text-slate-400">
                  <li>이메일 주소</li>
                  <li>견적서에 입력되는 고객 정보(고객이 제공한 정보)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제3조 (개인정보의 처리 및 보유 기간)</h2>
            <p className="mb-2">
              ① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보 주체로부터 개인정보를 수집 시에 동의 받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="border border-slate-700 px-3 py-2 text-left text-slate-300">항목</th>
                    <th className="border border-slate-700 px-3 py-2 text-left text-slate-300">보유 기간</th>
                    <th className="border border-slate-700 px-3 py-2 text-left text-slate-300">근거</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr>
                    <td className="border border-slate-700 px-3 py-2">회원 가입 정보</td>
                    <td className="border border-slate-700 px-3 py-2">회원 탈퇴 시까지</td>
                    <td className="border border-slate-700 px-3 py-2">이용 계약</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-700 px-3 py-2">거래 기록</td>
                    <td className="border border-slate-700 px-3 py-2">5년</td>
                    <td className="border border-slate-700 px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-700 px-3 py-2">접속 로그</td>
                    <td className="border border-slate-700 px-3 py-2">3개월</td>
                    <td className="border border-slate-700 px-3 py-2">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제4조 (개인정보의 제3자 제공)</h2>
            <p className="mb-2">
              회사는 원칙적으로 정보 주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 다음의 경우를 제외하고는 제3자에게 제공하지 않습니다.
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>정보 주체의 별도 동의가 있는 경우</li>
              <li>법령에 특별한 규정이 있거나 법령상 의무를 준수하기 위해 불가피한 경우</li>
              <li>수사기관이 수사 목적으로 법령에 정해진 절차와 방법에 따라 요청한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제5조 (개인정보 처리 위탁)</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="border border-slate-700 px-3 py-2 text-left text-slate-300">수탁 업체</th>
                    <th className="border border-slate-700 px-3 py-2 text-left text-slate-300">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr>
                    <td className="border border-slate-700 px-3 py-2">Supabase Inc.</td>
                    <td className="border border-slate-700 px-3 py-2">데이터베이스 및 파일 스토리지 호스팅</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-700 px-3 py-2">Vercel Inc.</td>
                    <td className="border border-slate-700 px-3 py-2">서비스 인프라 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제6조 (정보 주체의 권리·의무)</h2>
            <p className="mb-2">정보 주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-3 text-slate-400">
              권리 행사는 서비스 내 계정 설정 또는 아래 개인정보보호책임자에게 연락하여 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제7조 (개인정보의 파기)</h2>
            <p className="mb-2">
              회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 된 경우에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>전자적 파일: 기술적 방법을 사용하여 재생 불가능하도록 안전하게 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제8조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>비밀번호의 암호화(scrypt 단방향 해시) 저장 및 관리</li>
              <li>HTTPS(TLS) 적용을 통한 개인정보 전송 구간 암호화</li>
              <li>개인정보 접근 통제 및 접근 권한 최소화</li>
              <li>정기적인 보안 점검 및 취약점 관리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제9조 (개인정보보호책임자)</h2>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-4">
              <p className="text-slate-300 font-medium mb-2">개인정보보호책임자</p>
              <ul className="space-y-1 text-slate-400">
                <li>성명: 부엉이누수탐지랩 대표</li>
                <li>이메일: privacy@owlleak.com</li>
                <li>전화: 서비스 내 문의 기능 이용</li>
              </ul>
            </div>
            <p className="mt-3 text-slate-400">
              정보 주체는 개인정보보호법 제35조에 따른 개인정보 열람 요구, 동법 제36조에 따른 정정·삭제 요구, 동법 제37조에 따른 처리 정지 요구를 위와 같이 연락하여 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제10조 (권익 침해 구제 방법)</h2>
            <p className="mb-2">
              개인정보 침해에 대한 신고나 상담이 필요하신 경우 다음 기관에 문의하시기 바랍니다.
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>개인정보 침해신고센터: privacy.kisa.or.kr (국번 없이 118)</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr (1833-6972)</li>
              <li>대검찰청 사이버범죄수사단: www.spo.go.kr (02-3480-3573)</li>
              <li>경찰청 사이버안전국: cyberbureau.police.go.kr (국번 없이 182)</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs">부엉이누수탐지랩 · 개인정보처리방침 시행일: 2025년 1월 1일</p>
          <Link href="/register" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            <ArrowLeft size={14} />
            가입 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
