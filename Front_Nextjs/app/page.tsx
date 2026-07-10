// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col justify-between font-sans">
      {/* 히어로 섹션 */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto py-20">
        <div className="flex-inline animate-bounce inline-flex items-center gap-1.5 bg-white/80 border border-pink-50/90 text-pink-500 font-bold px-3 py-0.9 rounded-full text-[12.5px] uppercase tracking-wider mb-3 shadow-sm shadow-pink-100/50">
          <div className="text-[18px]">🎁</div> AI Gift Guide
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          선물 고민은 끝, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
            Golazo AI
          </span>
          가 딱 골라줄게요
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-[480px]">
          받는 사람의 간단한 정보만 입력하세요. 빅데이터와 AI 분석을 통해 실패
          없는 최고의 선물을 추천해줄게요.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <Link
            href="/recommend"
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-bold py-4 rounded-xl hover:opacity-95 transition-all disabled:opacity-50 text-base shadow-lg shadow-pink-200 flex items-center justify-center gap-2 tracking-wide cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            AI 선물 추천 시작하기 🤖
          </Link>
        </div>
      </main>

      {/* 푸터 (개인정보처리방침 링크 포함) */}
      <footer className="border-t border-slate-50 bg-white py-3 sm:py-6 text-center text-sm text-slate-500">
        <div className="mx-6 px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Golazo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-slate-900 hover:underline hover:underline-offset-4"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
