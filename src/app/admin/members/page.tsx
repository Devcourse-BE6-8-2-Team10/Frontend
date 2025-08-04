'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/utils/apiClient";
import AdminNavigation from "@/components/AdminNavigation";

interface Member {
  id: number;
  email: string;
  name: string;
  role: string;
  profileUrl?: string;
  status: string;
  createdAt: string;
  deletedAt?: string;
}

export default function AdminMembersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
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

  // 회원 목록 가져오기
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAllMembers();
      // 백엔드 응답 구조에 맞게 수정
      setMembers(response.data?.content || []);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      setError('회원 목록을 불러오는데 실패했습니다.');
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
            <h1 className="text-2xl font-bold text-white">관리자 - 회원 관리</h1>
          </div>
          
          {/* 관리자 네비게이션 */}
          <AdminNavigation user={user} />

          {/* 회원 목록 카드 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a365d]">회원 목록</h3>
              <div className="text-sm text-gray-600">
                총 {members.length}명의 회원
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
                <p className="text-gray-600">회원 목록을 불러오는 중...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <p className="text-gray-600">등록된 회원이 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">
                  백엔드에서 관리자 API가 구현되면 회원 목록이 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">이름</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">이메일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">권한</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">가입일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-500">{member.id}</td>
                        <td className="py-3 px-4 text-gray-900">{member.name}</td>
                        <td className="py-3 px-4 text-gray-900">{member.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : member.status === 'DELETED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-700 text-xs">
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