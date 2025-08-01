'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();

      // 로그아웃 후 홈페이지로 리다이렉트
      router.push('/');
    } catch (error) {
      // 로그아웃 실패 시 에러 메시지 출력
      console.error('로그아웃 실패:', error);

      // 에러가 발생해도 홈페이지로 리다이렉트
      router.push('/');
    }
  };

  // 로딩 중일 때는 스켈레톤 UI 표시
  if (loading) {
    return (
      <header className="bg-[#1a365d] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white text-xl font-bold">
            <Link href="/">특허바다</Link>
          </div>
          
          <nav className="flex gap-6 text-white">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              홈
            </Link>
            <Link href="/patents" className="hover:text-gray-300 transition-colors">
              특허목록
            </Link>
            
            {/* 로딩 중에는 스켈레톤 메뉴 표시 */}
            <div className="flex gap-6">
              <div className="w-16 h-6 bg-gray-400 animate-pulse rounded"></div>
              <div className="w-20 h-6 bg-gray-400 animate-pulse rounded"></div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#1a365d] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          <Link href="/">특허바다</Link>
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