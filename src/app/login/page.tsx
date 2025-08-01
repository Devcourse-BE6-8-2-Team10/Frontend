"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 로그인 상태에서 로그인 페이지 접근 방지
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중이거나 이미 로그인된 경우 로딩 화면 표시
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.data) {
        const { accessToken, refreshToken, memberInfo } = response.data.data;
        
        // AuthContext에 사용자 정보 저장 (쿠키에 자동으로 토큰이 저장됨)
        if (memberInfo) {
          login({
            id: memberInfo.id.toString(),
            email: memberInfo.email,
            name: memberInfo.name,
          }, accessToken, refreshToken);
        }
        
        // 로그인 성공 시 메인 페이지로 리다이렉트
        router.push("/");
      } else {
        setError("로그인 응답 데이터가 올바르지 않습니다.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("서버 연결에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1a365d] mb-2">로그인</h1>
              <p className="text-gray-600 text-sm">PatentMarket에 오신 것을 환영합니다</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                  비밀번호 찾기
                </a>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <a href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                  회원가입
                </a>
              </p>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="text-lg mr-2">📧</span>
                  이메일
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="text-lg mr-2">📱</span>
                  카카오
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}