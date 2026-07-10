// app/recommend/result/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  product_name: string;
  product_price: number;
  recommendation_reason: string;
  product_url: string;
  image_url: string;
}

export default function RecommendResultPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem("golazo_recommend_result");

    if (savedData) {
      setProducts(JSON.parse(savedData));
      //   setProducts(savedData);
      setIsReady(true);
    } else {
      alert("추천 결과가 없습니다. 정보를 다시 입력해 주세요 🥲");
      router.push("/recommend");
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-500">
        결과 화면을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 py-12 px-4 sm:px-6">
      <div className="absolute top-3 lg:top-6 left-2 lg:left-8 z-20">
        <button
          type="button"
          onClick={() => router.push("/recommend")}
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
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 ">
          <div className="inline-flex items-center  animate-bounce shadow-xs text-[12.5px] bg-slate-50 text-pink-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🎉 추천 완료
          </div>

          <h1 className="text-[28px] font-extrabold text-slate-900/90 tracking-tight mt-3 ">
            🤖 AI가 골라준 맞춤 선물
          </h1>
          <p className="text-slate-700/80 mt-2 text-[13.5px] font-medium">
            입력된 정보를 바탕으로 분석한 맞춤 선물 리스트입니다.
          </p>
        </div>

        {/* 결과 리스트 렌더링 */}
        <div className="space-y-6 mt-8">
          {products.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition hover:shadow-md"
            >
              <div className="flex gap-4 items-start mb-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-pink-50 rounded-xl flex items-center justify-center text-pink-400 text-xs font-semibold flex-shrink-0">
                    <div className="text-[45px]">🎁</div>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.product_name}
                  </h3>
                  <p className="text-pink-500 font-extrabold text-lg mt-1">
                    {item.product_price === 0
                      ? "변동"
                      : `${item.product_price.toLocaleString()}원`}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                <h4 className="text-[13px] font-bold text-slate-800 mb-1">
                  🤖 추천 이유
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.recommendation_reason}
                </p>
              </div>

              {/* 파트너스 아웃링크 버튼 */}
              <a
                href={item.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-bold py-4 rounded-2xl hover:opacity-95 transition-all disabled:opacity-50 text-base shadow-md shadow-pink-100 hover:shadow-pink-200 flex items-center justify-center gap-2 tracking-wide cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>🎁 선물 구매하러 가기 ➔</span>
              </a>

              {item.product_url.includes("coupang.com") && (
                <p className="text-[11px] text-slate-400 text-center mt-3 leading-none">
                  ※ 쿠팡 파트너스 활동의 일환으로 구매 시 소정의 수수료를
                  제공받습니다.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 💖 아기자기 솜사탕! 젤리처럼 누르고 싶은 모바일 앱 유도 카드 (CTA) */}
        <div className="mt-14 bg-gradient-to-br from-pink-300 via-rose-100 to-amber-200 rounded-[32px] p-8 text-center text-slate-800 shadow-[0_20px_50px_rgba(244,63,94,0.15)] relative overflow-hidden  shadow-pink-200">
          {/* 🎀 상단 앙증맞은 리본/스파클 배지 */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[11px] font-black tracking-wider px-3.5 py-1.5 rounded-full mb-5 shadow-md shadow-rose-200 animate-bounce">
            <span></span> for my People <span></span>
          </div>

          {/* 헤드라인 타이틀 */}
          <h3 className="text-2xl font-black mb-3 tracking-tight text-slate-900 drop-shadow-xs">
            소중한 사람들을 위한 선물 추천은{" "}
            <span className="relative inline-block text-rose-500">
              <span className="relative z-10 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
                Golazo 앱
              </span>
              <span className="absolute bottom-1 left-0 w-full h-2.5 bg-pink-200/60 rounded-full -z-0" />
            </span>
            에서!
          </h3>

          <p className="text-[14px] text-slate-700/80 mb-8 leading-relaxed max-w-md mx-auto font-semibold">
            앱에서 소중한 사람들을 기록하고 저장해보세요. <br />
            그리고, 기념일에 맞춰{" "}
            <span className="text-pink-600 font-bold"> 🔔 알람</span>을
            받아보세요!
          </p>

          {/* 🌟 3D 젤리 장난감처럼 쫀득한 버튼 구역 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-sm mx-auto relative z-10">
            <button
              onClick={() =>
                alert("구글플레이 심사 중입니다. 조금만 기다려주세요 🤗 ")
              }
              className="hover:scale-101"
            >
              <Image
                src="/images/playStore.png"
                alt="Google Play"
                width={200}
                height={100}
                className="object-contain "
              />
            </button>

            <button
              onClick={() =>
                alert("앱스토어 심사 중입니다. 조금만 기다려주세요 🤗 ")
              }
              className="hover:scale-101"
            >
              <Image
                src="/images/appStore.svg"
                alt="Google Play"
                width={200}
                height={100}
                className="object-contain "
              />
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-[13px] text-slate-600  font-bold hover:text-pink-500 transition-all duration-200 mt-9 inline-flex items-center gap-1.5 transform hover:scale-101 active:scale-95 cursor-pointer"
          >
            <span> 🧸 첫 화면으로</span>
          </button>
        </div>
      </div>
    </div>
  );
}
