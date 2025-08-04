'use client';

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyPage() {
  const { user, isAuthenticated, loading, refreshUserInfo } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // 페이지 로드 시 한 번만 사용자 정보 새로고침
  useEffect(() => {
    if (isAuthenticated && user) {
      // 페이지 로드 시 한 번만 사용자 정보 새로고침
      refreshUserInfo();
    }
  }, []);



  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated) {
    return (
      <div className="pb-10">
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">마이페이지</h1>
          
          {/* User Info Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-purple-600 text-xl">👤</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a365d]">{user?.name || '사용자'}</h2>
                  <p className="text-gray-600 text-sm">{user?.email || '이메일 없음'}</p>
                </div>
              </div>
                             <button 
                 onClick={() => router.push('/mypage/edit')}
                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-sm"
               >
                 개인정보 수정
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">5</div>
                <div className="text-sm text-gray-600">내 특허</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">12</div>
                <div className="text-sm text-gray-600">찜한 특허</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">3</div>
                <div className="text-sm text-gray-600">거래 완료</div>
              </div>
            </div>
          </div>
          
          {/* My Patents Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">내 특허</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* My Patent Card 1 */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-blue-600 text-lg">🔋</span>
                </div>
                <h4 className="font-bold text-[#1a365d] mb-2 text-sm">차세대 배터리 기술 특허</h4>
                <p className="text-gray-600 text-xs mb-3">고성능 리튬이온 배터리 기술</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩25,000,000</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">예약중</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-purple-600 hover:text-purple-700 text-sm">수정</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">삭제</button>
                </div>
              </div>
              
              {/* My Patent Card 2 */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
                <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                  <span className="text-green-600 text-lg">🏥</span>
                </div>
                <h4 className="font-bold text-[#1a365d] mb-2 text-sm">원격 의료 진단 시스템</h4>
                <p className="text-gray-600 text-xs mb-3">AI 기반 원격 의료 진단</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-[#1a365d]">₩18,500,000</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">판매완료</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-purple-600 hover:text-purple-700 text-sm">수정</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">삭제</button>
                </div>
              </div>
              
              {/* Add New Patent */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center bg-white/30">
                <button className="text-gray-500 hover:text-purple-600 transition-colors">
                  <div className="text-2xl mb-2">+</div>
                  <div className="text-sm">새 특허 등록</div>
                </button>
              </div>
            </div>
          </div>
          
                     {/* Liked Patents Section */}
           <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative">
             <h3 className="text-lg font-bold text-[#1a365d] mb-4">찜한 특허</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Liked Patent Card 1 */}
               <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
                 <div className="bg-pink-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                   <span className="text-pink-600 text-lg">🔊</span>
                 </div>
                 <h4 className="font-bold text-[#1a365d] mb-2 text-sm">AI 기반 음성인식 알고리즘</h4>
                 <p className="text-gray-600 text-xs mb-3">혁신적인 음성인식 기술</p>
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-base text-[#1a365d]">₩15,000,000</span>
                   <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                 </div>
                 <div className="flex gap-2">
                   <button className="text-purple-600 hover:text-purple-700 text-sm">구매문의</button>
                   <button className="text-red-600 hover:text-red-700 text-sm">찜해제</button>
                 </div>
               </div>
               
               {/* Liked Patent Card 2 */}
               <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
                 <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                   <span className="text-purple-600 text-lg">🌱</span>
                 </div>
                 <h4 className="font-bold text-[#1a365d] mb-2 text-sm">친환경 플라스틱 대체 기술</h4>
                 <p className="text-gray-600 text-xs mb-3">생분해성 소재 기술</p>
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-base text-[#1a365d]">₩12,000,000</span>
                   <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                 </div>
                 <div className="flex gap-2">
                   <button className="text-purple-600 hover:text-purple-700 text-sm">구매문의</button>
                   <button className="text-red-600 hover:text-red-700 text-sm">찜해제</button>
                 </div>
               </div>
             </div>
             
             
           </div>
        </div>
      </section>

      

      
    </div>
  );
}