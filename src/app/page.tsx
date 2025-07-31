'use client';

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 text-center max-w-5xl mx-auto shadow-xl">
            <h1 className="text-3xl font-bold text-[#1a365d] mb-4">특허 거래의 새로운 경험</h1>
            <p className="text-base text-[#1a365d] leading-relaxed">
              {isAuthenticated 
                ? `${user?.name}님을 위한 맞춤 특허를 찾아보세요.` 
                : '혁신적인 특허와 무형자산을 안전하고 편리하게 거래하세요. 전문가들이 인증한 고품질 특허만을 제공합니다.'
              }
            </p>
            {!isAuthenticated && (
              <div className="mt-6">
                <a 
                  href="/login" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium mr-4"
                >
                  로그인
                </a>
                <a 
                  href="/register" 
                  className="bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  회원가입
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex gap-3 mb-4">
              <input type="text" placeholder="특허명, 키워드, 발명자명으로 검색하세요..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                <option>전체 카테고리</option>
              </select>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">검색</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#인기특허</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#신규등록</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#가격대별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#기술분야별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#판매중</button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Patents Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-yellow-400 text-lg">🔥</span>
              ◆인기 특허
            </h2>
            <a href="/patents" className="text-white hover:text-gray-300 transition-colors text-sm">전체보기 →</a>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Patent Card 1 */}
              <a href="/patents/1" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-pink-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-pink-600 text-lg">🔊</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">AI 기반 음성인식 알고리즘 특허</h3>
                <p className="text-gray-600 text-xs mb-3">혁신적인 음성인식 기술로 다양한 언어를 정확하게 인식합니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩15,000,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">김발명가</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>

              {/* Patent Card 2 */}
              <a href="/patents/2" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-blue-600 text-lg">🔋</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">차세대 배터리 기술 특허</h3>
                <p className="text-gray-600 text-xs mb-3">고성능 리튬이온 배터리 기술로 에너지 효율성을 극대화합니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩25,000,000</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">예약중</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">박에너지</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>

              {/* Patent Card 3 */}
              <a href="/patents/3" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-green-600 text-lg">🏥</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">원격 의료 진단 시스템 특허</h3>
                <p className="text-gray-600 text-xs mb-3">AI 기반 원격 의료 진단으로 접근성을 높이는 혁신 기술입니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩18,500,000</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">판매완료</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">이의료</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>

              {/* Patent Card 4 */}
              <a href="/patents/4" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-purple-600 text-lg">🌱</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">친환경 플라스틱 대체 기술</h3>
                <p className="text-gray-600 text-xs mb-3">생분해성 소재로 환경오염을 줄이는 혁신적인 기술입니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩12,000,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">최환경</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Registered Patents Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">NEW</span>
              최근 등록된 특허
            </h2>
            <a href="/patents" className="text-white hover:text-gray-300 transition-colors text-sm">전체보기 →</a>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Patent Card 1 */}
              <a href="/patents/5" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-orange-600 text-lg">🚗</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">자율주행 센서 융합 기술</h3>
                <p className="text-gray-600 text-xs mb-3">다양한 센서를 융합하여 안전한 자율주행을 구현하는 기술입니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩30,000,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">정개발자</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>

              {/* Recent Patent Card 2 */}
              <a href="/patents/6" className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50">
                <div className="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-indigo-600 text-lg">📱</span>
                </div>
                <h3 className="font-bold text-[#1a365d] mb-2 text-sm">스마트폰 보안 인증 기술</h3>
                <p className="text-gray-600 text-xs mb-3">생체인식과 AI를 결합한 차세대 보안 인증 시스템입니다.</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩8,900,000</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">한보안</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
