'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminNavigation from "@/components/AdminNavigation";
import { adminAPI } from "@/utils/apiClient";

interface Patent {
  id: number;
  title: string;
  price: number;
  category: string;
  favoriteCnt: number;
  createdAt: string;
  imageUrl?: string;
}

export default function AdminPatentsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 로그인하지 않은 사용자나 ADMIN이 아닌 사용자는 접근 차단
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // 특허 목록 가져오기
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchPatents();
    }
  }, [user]);

  const fetchPatents = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAllPatents();
      // 백엔드 응답 구조에 맞게 수정 - response.data가 아닌 response 자체가 배열
      setPatents(response || []);
    } catch (error) {
      console.error('특허 목록 조회 실패:', error);
      setError('특허 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated || user?.role !== 'ADMIN') {
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">관리자 - 특허 관리</h1>
          </div>
          
          {/* 관리자 네비게이션 */}
          <AdminNavigation user={user} />

          {/* 특허 목록 카드 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a365d]">특허 목록</h3>
              <div className="text-sm text-gray-600">
                총 {patents.length}개의 특허
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">특허 목록을 불러오는 중...</p>
              </div>
            ) : patents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600">등록된 특허가 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">
                  백엔드에서 관리자 API가 구현되면 특허 목록이 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                                     <thead>
                     <tr className="border-b border-gray-200">
                       <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">제목</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">카테고리</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">가격</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">좋아요</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">등록일</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-700">관리</th>
                     </tr>
                   </thead>
                  <tbody>
                                         {patents.map((patent) => (
                       <tr key={patent.id} className="border-b border-gray-100 hover:bg-gray-50">
                         <td className="py-3 px-4 text-gray-500">{patent.id}</td>
                         <td className="py-3 px-4 text-gray-900 font-medium">{patent.title}</td>
                         <td className="py-3 px-4 text-gray-500">{patent.category}</td>
                         <td className="py-3 px-4 text-gray-500">{patent.price.toLocaleString()}원</td>
                         <td className="py-3 px-4 text-gray-500">{patent.favoriteCnt}</td>
                         <td className="py-3 px-4 text-gray-500">
                           {new Date(patent.createdAt).toLocaleDateString()}
                         </td>
                         <td className="py-3 px-4">
                           <div className="flex gap-2">
                             <button className="text-blue-600 hover:text-blue-700 text-xs">
                               보기
                             </button>
                             <button className="text-yellow-600 hover:text-yellow-700 text-xs">
                               수정
                             </button>
                             <button className="text-red-600 hover:text-red-700 text-xs">
                               삭제
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 