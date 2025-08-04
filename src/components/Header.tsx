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
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <header className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text text-xl font-bold">
            <Link href="/">특허바다</Link>
          </div>

          <nav className="flex items-center gap-6 text-gray-700">
            <Link href="/" className="hover:text-indigo-500 transition-colors">
              홈
            </Link>
            <Link href="/patents" className="hover:text-indigo-500 transition-colors">
              특허목록
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-16 h-6 bg-gray-300 animate-pulse rounded"></div>
              <div className="w-20 h-6 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text text-xl font-bold">
          <Link href="/">특허바다</Link>
        </div>

        <nav className="flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:text-indigo-500 transition-colors">
            홈
          </Link>
          <Link href="/patents" className="hover:text-indigo-500 transition-colors">
            특허목록
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/patents/register" className="hover:text-indigo-500 transition-colors">
                특허등록
              </Link>
              <Link href="/chat" className="hover:text-indigo-500 transition-colors">
                채팅
              </Link>
              <Link href="/mypage" className="hover:text-indigo-500 transition-colors">
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-indigo-500 transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-[#667EEA] text-[#667EEA] hover:bg-[#667EEA] hover:text-white px-4 py-2 rounded-md transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
              >
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