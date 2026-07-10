"use client";
import { useRouter } from "next/navigation";

// src/app/privacy/page.tsx
export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-rose-50 py-16 px-4 font-sans flex items-center justify-center">
      <div className="absolute top-4 lg:top-6 left-2 lg:left-8 z-20">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 text-slate-700 hover:text-pink-400 transition-colors cursor-pointer"
          aria-label="홈으로"
        >
          {/* 심플하고 모던한 SVG 왼쪽 화살표 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto border border-slate-200/60 bg-white rounded-3xl p-6 sm:p-12 shadow-xl shadow-pink-100/20">
        <h1 className="text-center text-2xl sm:text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-5">
          Golazo 개인정보처리방침
        </h1>

        <p className="  text-xs font-bold text-slate-500 mb-6 bg-slate-50 inline-block px-3 py-1 rounded-md border border-slate-100">
          시행일자: 2026년 7월 10일
        </p>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* 1항 */}
          <section>
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">1.</span> 수집하는 개인정보 항목
              및 수집방법
            </h2>
            <p className="mb-2 text-slate-600">
              Golazo(이하 '서비스')는 구글 및 애플 소셜 로그인 연동 시 사용자의
              최소한의 정보만을 수집합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <li>
                <span className="font-semibold text-slate-800">
                  회원 가입 시 수집 항목:
                </span>{" "}
                이름(닉네임), 이메일 주소
              </li>
              <li>
                <span className="font-semibold text-slate-800">
                  비회원 이용 시:
                </span>{" "}
                로그인 없이 이용하는 AI 추천 서비스의 경우, 입력한 정보 (선물
                목적, 연령대, 성별, 예산 등)은 추천 결과 생성을 위한 일회성
                데이터로 활용되며, 개인을 식별할 수 있는 형태로 저장되지
                않습니다.
              </li>
            </ul>
          </section>

          {/* 2항 */}
          <section>
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">2.</span> 개인정보의 이용 목적 및
              보유 기간
            </h2>
            <p className="mb-2 text-slate-600">
              수집된 개인정보는 사용자 식별, AI 기반 개인화 선물 추천 서비스
              제공, 서비스 부정 이용 방지 목적에 한해서만 활용됩니다.
            </p>
            <p className="text-slate-800 font-bold bg-pink-50/30 border border-pink-100/60 p-3 rounded-xl text-xs">
              📌 보유 및 이용 기간: 이용자의 개인정보는 원칙적으로 회원 탈퇴
              시까지 보유하며, 회원 탈퇴 즉시 아래 파기 절차에 따라 영구
              삭제됩니다.
            </p>
          </section>

          {/* 3항 */}
          <section className="bg-gradient-to-br from-pink-50/60 to-rose-50/60 border border-pink-100 rounded-2xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-black text-pink-950 mb-3 flex items-center gap-1.5">
              <span className="text-pink-600">3.</span> 개인정보의 파기 절차 및
              방법 (회원 탈퇴)
            </h2>
            <p className="text-pink-900 mb-3 font-semibold text-xs bg-white px-3 py-1.5 rounded-lg border border-pink-200/50 inline-block">
              사용자는 모바일 앱 내 [환경 설정 - 회원 탈퇴] 메뉴를 통해 언제든지
              즉시 회원 탈퇴 및 정보 파기를 요청할 수 있습니다.
            </p>
            <p className="text-slate-700 text-[13px] leading-relaxed">
              사용자가 탈퇴를 요청하거나 수집 목적이 달성된 경우, 수집된 이름,
              이메일, 프로필 데이터는 데이터베이스에서 기술적으로 복구 및 재생이
              불가능한 방법으로 즉시 영구 삭제됩니다.
            </p>
          </section>

          {/* 4항 (신설) */}
          <section>
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">4.</span> 이용자의 권리 및
              행사방법
            </h2>
            <p className="text-slate-600">
              이용자는 언제든지 등록되어 있는 본인의 개인정보를 열람하거나
              수정할 수 있으며, 이메일 문의 혹은 앱 내 탈퇴 기능을 통해
              개인정보의 수집 및 이용 동의 철회(회원 탈퇴)를 요청할 수 있습니다.
              서비스는 이에 대해 지체 없이 조치합니다.
            </p>
          </section>

          {/* 5항 (신설) */}
          <section>
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">5.</span> 쿠키(Cookie)의 설치·운영
              및 거부에 관한 사항
            </h2>
            <p className="text-slate-600 mb-1">
              서비스는 이용자에게 개인화된 서비스를 제공하기 위해 세션 유지
              목적으로 일부 쿠키(Cookie)를 사용할 수 있습니다.
            </p>
            <p className="text-xs text-slate-500">
              - 이용자는 브라우저 옵션 설정을 통해 쿠키 저장을 거부할 수
              있습니다. 다만, 쿠키 저장을 거부할 경우 소셜 로그인 등 일부 서비스
              이용에 어려움이 발생할 수 있습니다.
            </p>
          </section>

          {/* 6항 */}
          <section>
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">6.</span> 개인정보의 제3자 제공
            </h2>
            <p className="text-slate-600">
              Golazo는 사용자의 개인정보를 제3자에게 판매하거나 무단으로
              제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로
              법령에 정해진 절차와 방법에 따른 수사기관의 요구가 있는 경우는
              제외됩니다.
            </p>
          </section>

          {/* 7항 */}
          <section className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-pink-500">7.</span> 개인정보 보호책임자 안내
            </h2>
            <p className="text-slate-600">
              서비스 이용 중 발생하는 개인정보 관련 문의, 불만 처리 및 탈퇴 관련
              권리 행사는 아래의 보호책임자 연락처로 문의해 주시기 바랍니다.
              서비스는 이용자의 문의에 신속하고 성실하게 답변해 드릴 것입니다.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-3 text-xs space-y-1 text-slate-600 font-medium">
              <p>• 개인정보 보호책임자: 김성진</p>
              <p>
                • 이메일 문의:{" "}
                <a
                  href="mailto:ksz18601@gmail.com"
                  className="text-pink-600 font-bold underline hover:text-pink-700"
                >
                  ksz18601@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
