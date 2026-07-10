// app/recommend/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "@/api/client";

interface RecommendRequest {
  purpose: string;
  age_group: string;
  gender: string;
  min_budget: number;
  max_budget: number;
  mbti: string | null;
  hobbies: string | null;
  notes: string | null;
}

interface Product {
  product_name: string;
  product_price: number;
  recommendation_reason: string;
  product_url: string;
  image_url: string;
}

const PURPOSE_OPTIONS = [
  { value: "FRIEND_BDAY", label: "친구 생일" },
  { value: "LOVER_BDAY", label: "애인 생일" },
  { value: "PARENTS_BDAY", label: "부모님 생신" },
  { value: "COUPLE_ANNIV", label: "커플 기념일" },
  { value: "WED_ANNIV", label: "결혼 기념일" },
  { value: "GRADUATE", label: "졸업" },
  { value: "EMPLOY", label: "취업" },
  { value: "HOUSE", label: "집들이" },
  { value: "BIRTH", label: "출산" },
  { value: "SELF_GIFT", label: "나에게 선물" },
];

const AGE_OPTIONS = [
  { value: "0", label: "10대 미만" },
  { value: "10", label: "10대" },
  { value: "20", label: "20대" },
  { value: "30", label: "30대" },
  { value: "40", label: "40대" },
  { value: "50", label: "50대" },
  { value: "60", label: "60대" },
  { value: "70", label: "70대" },
  { value: "80", label: "80대 이상" },
];

const fetchQuickRecommendation = async (
  payload: RecommendRequest,
): Promise<Product[]> => {
  const response = await client.post("gift/quick/recommend/", payload);
  return response.data.recommendations || [];
};

export default function QuickRecommendPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    age_group: "20",
    gender: "남성",
    purpose: "FRIEND_BDAY",
    hobbies: "",
    notes: "",
  });

  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(150000);

  const [mbtiState, setMbtiState] = useState({
    ie: "",
    sn: "",
    tf: "",
    jp: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: fetchQuickRecommendation,
    onSuccess: (data) => {
      sessionStorage.setItem("golazo_recommend_result", JSON.stringify(data));
      router.push("/recommend/result");
    },
    onError: (error) => {
      console.error("추천 호출 실패:", error);
      alert(
        "AI 추천 서버와 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMbti = (key: keyof typeof mbtiState, value: string) => {
    setMbtiState((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedMbti = `${mbtiState.ie}${mbtiState.sn}${mbtiState.tf}${mbtiState.jp}`;

    const payload: RecommendRequest = {
      purpose: formData.purpose,
      age_group: formData.age_group,
      gender: formData.gender,
      min_budget: minBudget,
      max_budget: maxBudget,
      mbti: combinedMbti || null,
      hobbies: formData.hobbies.trim() || null,
      notes: formData.notes.trim() || null,
    };

    mutate(payload);
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString() + "원";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 py-16 px-4 sm:px-6 flex flex-col justify-center items-center relative">
      {/* 🌟 깔끔한 slate 색상 뒤로가기 화살표 버튼 */}
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

      <div className="max-w-2xl w-full mx-auto">
        {/* 상단 헤더 타이틀 */}
        <div className="text-center mb-10">
          <div className="inline-flex animate-bounce items-center gap-1.5 bg-white/80 border border-pink-200/60 text-pink-500 font-bold px-3 py-1 rounded-full text-[13px] uppercase tracking-wider mb-3 shadow-sm shadow-pink-100/50">
            <span>✏️</span> 정보 입력 <span></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-none">
            맞춤형{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              AI 선물 추천
            </span>
          </h1>
          <p className="text-slate-700/80 mt-3 text-sm font-medium">
            아래 정보를 입력하면 Golazo AI가 맞춤형 선물을 추천해 줍니다 🤖
          </p>
        </div>

        {/* 메인 설문 폼 카드 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-pink-200/30 border border-white space-y-6"
        >
          {/* 1열: 목적 및 연령대 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                🥳 선물 목적
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50/60 transition bg-white text-slate-800 font-medium cursor-pointer shadow-sm"
              >
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                🎂 연령대
              </label>
              <select
                name="age_group"
                value={formData.age_group}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50/60 transition bg-white text-slate-800 font-medium cursor-pointer shadow-sm"
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2열: 성별 및 취미 관심사 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                🧬 성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50/60 transition bg-white text-slate-800 font-medium cursor-pointer shadow-sm"
              >
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                🎨 취미 및 관심사 (생략 가능)
              </label>
              <input
                type="text"
                name="hobbies"
                placeholder="예: 독서, 등산, 홈카페 등"
                value={formData.hobbies}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50/60 transition placeholder:text-slate-300 text-slate-800 font-medium shadow-sm"
              />
            </div>
          </div>

          {/* 3열: MBTI 박스 */}
          <div>
            <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              🔮 MBTI (생략 가능)
            </label>
            <div className="grid grid-cols-4 gap-3 h-[48px]">
              <div className="flex bg-slate-100/80 rounded-xl p-1 border border-slate-200/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => toggleMbti("ie", "I")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.ie === "I" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => toggleMbti("ie", "E")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.ie === "E" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  E
                </button>
              </div>
              <div className="flex bg-slate-100/80 rounded-xl p-1 border border-slate-200/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => toggleMbti("sn", "S")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.sn === "S" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => toggleMbti("sn", "N")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.sn === "N" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  N
                </button>
              </div>
              <div className="flex bg-slate-100/80 rounded-xl p-1 border border-slate-200/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => toggleMbti("tf", "T")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.tf === "T" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  T
                </button>
                <button
                  type="button"
                  onClick={() => toggleMbti("tf", "F")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.tf === "F" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  F
                </button>
              </div>
              <div className="flex bg-slate-100/80 rounded-xl p-1 border border-slate-200/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => toggleMbti("jp", "J")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.jp === "J" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  J
                </button>
                <button
                  type="button"
                  onClick={() => toggleMbti("jp", "P")}
                  className={`flex-1 text-[13px] font-bold rounded-lg transition-all ${mbtiState.jp === "P" ? "bg-pink-500/90 text-white shadow-md shadow-pink-200" : "text-slate-500 hover:bg-white/60"}`}
                >
                  P
                </button>
              </div>
            </div>
          </div>

          {/* 4열: 특이사항 */}
          <div>
            <label className="flex items-center gap-1 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              🧸 특이사항 (생략 가능)
            </label>
            <textarea
              name="notes"
              placeholder="예: 향수 냄새를 싫어함, 고양이를 키우고 있음 등"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50/60 transition placeholder:text-slate-300 text-slate-800 font-medium h-24 resize-none shadow-sm"
            />
          </div>

          {/* 5열: 예산 슬라이더 섹션 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 shadow-inner">
            {/* 최소 예산 */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  🪙 최소 예산
                </label>
                <span className="text-[13px] font-black text-pink-600 bg-white border border-pink-100 px-2 py-0.5 rounded-full shadow-sm select-none">
                  {formatPrice(minBudget)}
                </span>
              </div>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="10000"
                  value={minBudget}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val <= maxBudget) setMinBudget(val);
                  }}
                  className="w-full accent-pink-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:w-5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-pink-500 
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:duration-100
                    hover:[&::-webkit-slider-thumb]:scale-110
                    active:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
            </div>

            {/* 최대 예산 */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  💎 최대 예산
                </label>
                <span className="text-[13px] font-black text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded-full shadow-sm select-none">
                  {maxBudget >= 300000 ? "30만원 이상" : formatPrice(maxBudget)}
                </span>
              </div>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="10000"
                  max="300000"
                  step="10000"
                  value={maxBudget}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val >= minBudget) setMaxBudget(val);
                  }}
                  className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:w-5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-rose-500 
                    [&::-webkit-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:duration-100
                    hover:[&::-webkit-slider-thumb]:scale-110
                    active:[&::-webkit-slider-thumb]:scale-125"
                />
              </div>
            </div>
          </div>

          {minBudget === maxBudget && (
            <p className="text-[13px] text-slate-500/90 text-center col-span-1 sm:col-span-2 mt-2 animate-fade-in">
              ⚠️ 최소 예산은 최대 예산을 넘어설 수 없어요!
            </p>
          )}
          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-bold py-4 rounded-xl hover:opacity-95 transition-all disabled:opacity-50 text-base shadow-lg shadow-pink-200 flex items-center justify-center gap-2 tracking-wide cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? (
              <>
                <span>AI가 선물을 고르는 중...</span>
                <span className="animate-spin text-lg">🎁</span>
              </>
            ) : (
              <>
                <span>맞춤 선물을 골라조~</span>
                <span className="text-xl">🤖</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
