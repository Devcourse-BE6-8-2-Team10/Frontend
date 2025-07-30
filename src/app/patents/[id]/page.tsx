import React from "react";

export default function PatentDetailPage() {
  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-white text-sm mb-6">
            <a href="/" className="hover:text-gray-300">홈</a> &gt; 
            <a href="/patents" className="hover:text-gray-300">특허목록</a> &gt; 
            <span>특허 상세</span>
          </div>
          
          {/* Patent Detail Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-pink-600 text-2xl">🔊</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1a365d] mb-2">AI 기반 음성인식 알고리즘 특허</h1>
                <p className="text-gray-600 mb-4">혁신적인 음성인식 기술로 다양한 언어를 정확하게 인식하는 특허입니다.</p>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-xl text-[#1a365d]">₩15,000,000</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">판매중</span>
                  <span className="text-gray-500">소유자: 김발명가</span>
                </div>
              </div>
            </div>
            
            {/* Patent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-[#1a365d] mb-3">특허 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">특허번호:</span>
                    <span>KR-2024-001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">출원일:</span>
                    <span>2024.01.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">공개일:</span>
                    <span>2024.07.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">등록일:</span>
                    <span>2024.12.01</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#1a365d] mb-3">기술 분야</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주분류:</span>
                    <span>G10L 15/00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">부분류:</span>
                    <span>G10L 15/22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">기술분야:</span>
                    <span>AI/음성인식</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Abstract */}
            <div className="mb-6">
              <h3 className="font-bold text-[#1a365d] mb-3">요약</h3>
              <p className="text-gray-700 leading-relaxed">
                본 발명은 다국어 음성인식을 위한 혁신적인 알고리즘에 관한 것으로, 
                딥러닝 기술을 활용하여 다양한 언어의 음성을 정확하게 인식하고 
                텍스트로 변환하는 기술입니다. 특히 노이즈 환경에서도 높은 인식률을 
                보장하며, 실시간 처리 속도를 크게 향상시켰습니다.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                구매 문의
              </button>
              <button className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition-colors">
                찜하기
              </button>
              <button className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors">
                공유하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}