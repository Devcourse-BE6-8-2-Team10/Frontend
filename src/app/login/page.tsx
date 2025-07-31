"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 백엔드 서버로 로그인 요청
      const backendUrl = 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 로그인 성공 시 토큰 저장
        if (data.data) {
          const { accessToken, refreshToken, memberInfo } = data.data;
          
          // AccessToken만 localStorage에 저장 (보안상 RefreshToken은 서버에서 관리)
          localStorage.setItem('accessToken', accessToken);
          
          // 사용자 정보 저장
          if (memberInfo) {
            localStorage.setItem('userInfo', JSON.stringify(memberInfo));
          }
          
          // 로그인 성공 시 메인 페이지로 리다이렉트
          router.push("/");
        } else {
          setError("로그인 응답 데이터가 올바르지 않습니다.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "이메일 또는 비밀번호가 잘못되었습니다.");
      }
    } catch (error) {
      setError("서버 연결에 실패했습니다. 다시 시도해주세요.");
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
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                  />
                  <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                </label>
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