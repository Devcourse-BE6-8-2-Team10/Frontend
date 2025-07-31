import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PatentMarket",
  description: "혁신적인 특허와 무형자산을 안전하고 편리하게 거래하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
          {/* Header */}
          <header className="bg-[#1a365d] px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="text-white text-xl font-bold">PatentMarket</div>
              <nav className="flex gap-6 text-white">
                <a href="/" className="hover:text-gray-300 transition-colors">
                  홈
                </a>
                <a
                  href="/patents"
                  className="hover:text-gray-300 transition-colors"
                >
                  특허목록
                </a>
                <a
                  href="/mypage"
                  className="hover:text-gray-300 transition-colors"
                >
                  마이페이지
                </a>
                <a
                  href="/login"
                  className="hover:text-gray-300 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/register"
                  className="hover:text-gray-300 transition-colors"
                >
                  회원가입
                </a>
                <a
                  href="/chat"
                  className="hover:text-gray-300 transition-colors"
                >
                  채팅
                </a>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="bg-[#1a365d] px-6 py-8 mt-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">
                    PatentMarket
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    혁신적인 특허와 무형자산을 안전하고 편리하게 거래하는
                    플랫폼입니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">서비스</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        특허 검색
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        특허 등록
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        거래 중개
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        법률 자문
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">고객지원</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        자주 묻는 질문
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        1:1 문의
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        이용약관
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        개인정보처리방침
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">연락처</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="text-gray-300">전화: 02-1234-5678</li>
                    <li className="text-gray-300">
                      이메일: info@patentmarket.com
                    </li>
                    <li className="text-gray-300">
                      주소: 서울시 강남구 테헤란로 123
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-600 mt-8 pt-8 text-center">
                <p className="text-gray-300 text-sm">
                  © 2024 PatentMarket. All rights reserved.
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <button className="bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-lg transition-colors flex items-center justify-center">
              <span className="text-xl">💬</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
