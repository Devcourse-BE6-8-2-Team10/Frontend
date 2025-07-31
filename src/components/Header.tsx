'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // 로그아웃 후 홈페이지로 리다이렉트
    window.location.href = '/';
  };

  return (
    <header className="bg-[#1a365d] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          <Link href="/">PatentMarket</Link>
        </div>
        
        <nav className="flex gap-6 text-white">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            홈
          </Link>
          <Link href="/patents" className="hover:text-gray-300 transition-colors">
            특허목록
          </Link>
          
          {isAuthenticated ? (
            // 로그인 후 메뉴
            <>
              <Link href="/chat" className="hover:text-gray-300 transition-colors">
                채팅
              </Link>
              <Link href="/mypage" className="hover:text-gray-300 transition-colors">
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            // 로그인 전 메뉴
            <>
              <Link href="/login" className="hover:text-gray-300 transition-colors">
                로그인
              </Link>
              <Link href="/register" className="hover:text-gray-300 transition-colors">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 