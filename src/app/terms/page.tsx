import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/register" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft size={16} />
            가입 페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-white">이용약관</h1>
          <p className="text-slate-500 text-sm mt-2">시행일: 2025년 1월 1일</p>
        </div>

        <div className="space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 부엉이누수탐지랩(이하 &ldquo;회사&rdquo;)이 제공하는 누수탐지 CRM 서비스(이하 &ldquo;서비스&rdquo;)의 이용에 관한 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제2조 (정의)</h2>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li><span className="text-slate-300">&ldquo;서비스&rdquo;</span>란 회사가 제공하는 누수탐지 현장 업무 관리, 견적 산출, 고객 관리 등의 SaaS 플랫폼을 말합니다.</li>
              <li><span className="text-slate-300">&ldquo;회원&rdquo;</span>이란 이 약관에 동의하고 서비스 이용 계약을 체결한 업체 또는 개인을 말합니다.</li>
              <li><span className="text-slate-300">&ldquo;구독&rdquo;</span>이란 회원이 선택한 플랜(Trial·Basic·Pro)에 따라 서비스를 이용하는 계약 관계를 말합니다.</li>
              <li><span className="text-slate-300">&ldquo;콘텐츠&rdquo;</span>란 회원이 서비스를 통해 등록·관리하는 고객 정보, 견적서, 작업 일지, 사진 등을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="mb-2">
              ① 이 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.
            </p>
            <p className="mb-2">
              ② 회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 위배되지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여 현행 약관과 함께 서비스 화면에 7일 이상 공지합니다.
            </p>
            <p>
              ③ 회원이 개정된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 계약을 해지할 수 있습니다. 개정 공지 이후 계속 서비스를 이용하면 약관 변경에 동의한 것으로 간주합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제4조 (서비스 이용 신청 및 승인)</h2>
            <p className="mb-2">
              ① 서비스를 이용하고자 하는 자는 회사가 정한 가입 양식에 따라 정보를 입력하고 이 약관에 동의하여 이용 신청을 합니다.
            </p>
            <p className="mb-2">
              ② 회사는 신청 내용을 검토한 후 승인 여부를 이메일 또는 앱 내 알림으로 통보하며, 승인 완료 후 서비스 이용이 가능합니다. 통상 영업일 기준 1~2일 내에 안내드립니다.
            </p>
            <p>
              ③ 다음 각 호에 해당하는 경우 가입 승인을 거부하거나 사후에 이용계약을 해지할 수 있습니다.
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
              <li>타인의 정보를 도용하거나 허위 정보를 등록한 경우</li>
              <li>서비스를 불법적 목적으로 이용하려는 경우</li>
              <li>기술적으로 서비스 제공이 불가한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제5조 (구독 플랜 및 요금)</h2>
            <p className="mb-2">
              ① 서비스는 Trial(14일 무료), Basic, Pro 세 가지 플랜으로 제공됩니다.
            </p>
            <p className="mb-2">
              ② 무료 체험(Trial) 기간 종료 후 유료 플랜으로 전환하지 않으면 서비스 이용이 제한될 수 있습니다.
            </p>
            <p>
              ③ 요금 및 결제 방법은 서비스 내 요금 안내 페이지에 따르며, 회사는 사전 공지를 통해 변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제6조 (회원의 의무)</h2>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li>회원은 서비스 이용 시 관련 법령 및 이 약관을 준수하여야 합니다.</li>
              <li>타인의 개인정보를 무단으로 수집·이용하거나 서비스를 통해 타인에게 피해를 주는 행위를 금합니다.</li>
              <li>계정 정보(아이디, 비밀번호)는 회원이 관리할 책임이 있으며, 제3자에게 양도하거나 공유할 수 없습니다.</li>
              <li>서비스의 안정적 운영을 방해하는 일체의 행위를 금합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제7조 (서비스 제공 및 중단)</h2>
            <p className="mb-2">
              ① 회사는 연중무휴 24시간 서비스 제공을 원칙으로 하되, 시스템 점검·설비 보수 등의 사유로 서비스를 일시적으로 중단할 수 있습니다.
            </p>
            <p>
              ② 천재지변, 국가비상사태, 정전 등 불가항력적 사유로 서비스 제공이 불가능한 경우 회사는 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제8조 (손해배상 및 면책)</h2>
            <p className="mb-2">
              ① 회사는 서비스 이용으로 발생한 손해에 대해 관련 법령이 정하는 범위 내에서만 책임을 집니다.
            </p>
            <p>
              ② 회원이 이 약관을 위반하여 회사에 손해를 끼친 경우, 회원은 해당 손해를 배상할 책임이 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제9조 (분쟁 해결)</h2>
            <p>
              이 약관과 관련된 분쟁은 대한민국 법률에 따르며, 분쟁이 발생할 경우 회사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제10조 (기타)</h2>
            <p>
              이 약관에서 정하지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령의 규정에 따릅니다.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs">부엉이누수탐지랩 · 이용약관 시행일: 2025년 1월 1일</p>
          <Link href="/register" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            <ArrowLeft size={14} />
            가입 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
