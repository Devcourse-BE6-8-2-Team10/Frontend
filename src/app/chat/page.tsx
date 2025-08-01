import React from "react";
import Footer from "@/components/Footer";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      {/* Main Content */}
      <div className="flex flex-1 justify-center items-start py-10">
        {/* Chat List */}
        <aside className="w-72 bg-white/90 rounded-2xl shadow-xl p-6 mr-8 flex flex-col h-[700px]">
          <h2 className="text-lg font-bold mb-6 text-[#1a365d]">채팅 목록</h2>
          <ul className="space-y-4 flex-1 overflow-y-auto">
            <li className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-semibold text-[#1a365d]">김발명가</div>
                <div className="text-xs text-gray-500">
                  AI 기반 음성인식 알고리즘
                </div>
              </div>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-semibold text-[#1a365d]">이연구원</div>
                <div className="text-xs text-gray-500">
                  배터리 기술 특허 문의
                </div>
              </div>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-semibold text-[#1a365d]">박회사</div>
                <div className="text-xs text-gray-500">
                  블록체인 관련 시스템
                </div>
              </div>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-semibold text-[#1a365d]">강개발자</div>
                <div className="text-xs text-gray-500">자율주행 센서 상담</div>
              </div>
            </li>
          </ul>
        </aside>
        {/* Chat Area */}
        <section className="flex-1 bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col h-[700px] min-w-[600px] max-w-2xl">
          {/* Chat Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="text-xl font-bold text-[#1a365d]">김발명가</div>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <div className="flex flex-col items-start">
              <div className="bg-gray-100 rounded-xl px-4 py-2 text-sm text-[#1a365d] max-w-[70%]">
                안녕하세요. AI 기반 음성인식 알고리즘 특허에 대해 문의드립니다.
              </div>
              <div className="text-xs text-gray-400 mt-1">
                2025-07-23 10:00 AM
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-[#7c5dfa] text-white rounded-xl px-4 py-2 text-sm max-w-[70%]">
                네, 무엇이 궁금하신가요? 상세한 설명을 드릴 수 있습니다.
              </div>
              <div className="text-xs text-gray-400 mt-1">
                2025-07-23 10:02 AM
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-gray-100 rounded-xl px-4 py-2 text-sm text-[#1a365d] max-w-[70%]">
                이 특허의 주요 특징과 어떤 산업 분야에 적용될 수 있을지 알려주실
                수 있을까요?
              </div>
              <div className="text-xs text-gray-400 mt-1">
                2025-07-23 10:05 AM
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-[#7c5dfa] text-white rounded-xl px-4 py-2 text-sm max-w-[70%]">
                이 특허는 딥러닝 기반의 고효율 음성 인식과 실시간 자연어 처리가
                가능하며, 콜센터, 스마트홈, 차량 인포테인먼트 등 다양한 산업에
                적용 가능합니다.
              </div>
              <div className="text-xs text-gray-400 mt-1">
                2025-07-23 10:07 AM
              </div>
            </div>
          </div>
          {/* Chat Input */}
          <form className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="메시지를 입력하세요..."
            />
            <button
              type="submit"
              className="bg-[#7c5dfa] hover:bg-[#6842c2] text-white px-6 py-2 rounded-lg transition-colors"
            >
              전송
            </button>
          </form>
        </section>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
