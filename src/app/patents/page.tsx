"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  description?: string; // 상세 조회에서만 사용
  category: string;
  price: number;
  status?: string; // 상세 조회에서만 사용
  favoriteCnt: number;
  isLiked?: boolean; // 상세 조회에서만 사용
  createdAt: string;
  modifiedAt?: string; // 상세 조회에서만 사용
}

export default function PatentsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리");
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  // 게시글 목록 조회 (인증 없이 접근 가능)
  const fetchPosts = async () => {
    try {
      console.log('API 호출 시작: /api/posts');
      const response = await apiClient.get('/api/posts');
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 데이터:', response.data);
      setPosts(response.data);
    } catch (error: any) {
      console.error('게시글 목록 조회 실패:', error);
      
      // API 호출 실패 시 임시 데이터로 대체 (인증 오류 리다이렉트 제거)
      setPosts([
        { id: 1, title: "AI 기반 음성인식 알고리즘 특허", category: "물건발명", price: 15000000, favoriteCnt: 23, createdAt: "2024-01-15T10:00:00" },
        { id: 2, title: "차세대 배터리 기술 특허", category: "방법발명", price: 25000000, favoriteCnt: 45, createdAt: "2024-01-14T10:00:00" },
        { id: 3, title: "원격 의료 진단 시스템 특허", category: "용도발명", price: 18500000, favoriteCnt: 67, createdAt: "2024-01-13T10:00:00" },
        { id: 4, title: "친환경 플라스틱 대체 기술", category: "물건발명", price: 12000000, favoriteCnt: 34, createdAt: "2024-01-12T10:00:00" },
        { id: 5, title: "자율주행 센서 융합 기술", category: "방법발명", price: 30000000, favoriteCnt: 89, createdAt: "2024-01-11T10:00:00" },
        { id: 6, title: "스마트폰 보안 인증 기술", category: "용도발명", price: 8900000, favoriteCnt: 56, createdAt: "2024-01-10T10:00:00" },
        { id: 7, title: "고효율 태양광 패널 기술", category: "물건발명", price: 22000000, favoriteCnt: 78, createdAt: "2024-01-09T10:00:00" },
        { id: 8, title: "유전자 편집 기술 특허", category: "방법발명", price: 45000000, favoriteCnt: 123, createdAt: "2024-01-08T10:00:00" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 인기 게시글 조회 (인증 없이 접근 가능)
  const fetchPopularPosts = async () => {
    try {
      const response = await apiClient.get('/api/posts/popular');
      setPopularPosts(response.data);
    } catch (error) {
      console.error('인기 게시글 조회 오류:', error);
    }
  };

  // 찜 등록/해제 (로그인 필요)
  const toggleLike = async (postId: number) => {
    // 찜 기능은 로그인한 사용자만 가능
    if (!isAuthenticated) {
      console.log('찜 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/login';
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const method = post.isLiked ? 'delete' : 'post';
      const response = await apiClient[method](`/api/likes/${postId}`);

      if (response.status === 200) {
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isLiked: !p.isLiked, favoriteCnt: p.isLiked ? p.favoriteCnt - 1 : p.favoriteCnt + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('찜 토글 오류:', error);
    }
  };

  // 검색 및 필터링
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체 카테고리" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["전체 카테고리", "물건발명", "방법발명", "용도발명", "디자인권", "상표권", "저작권", "기타"];

  const getEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      "물건발명": "🔊", "방법발명": "🔋", "용도발명": "🏥", "디자인권": "🎨", "상표권": "™️", "저작권": "📝", "기타": "⚡"
    };
    return emojiMap[category] || "⚡";
  };

  const getBgColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "물건발명": "bg-pink-100", "방법발명": "bg-blue-100", "용도발명": "bg-green-100", "디자인권": "bg-purple-100", "상표권": "bg-orange-100", "저작권": "bg-indigo-100", "기타": "bg-yellow-100"
    };
    return colorMap[category] || "bg-yellow-100";
  };

  const getTextColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "물건발명": "text-pink-600", "방법발명": "text-blue-600", "용도발명": "text-green-600", "디자인권": "text-purple-600", "상표권": "text-orange-600", "저작권": "text-indigo-600", "기타": "text-yellow-600"
    };
    return colorMap[category] || "text-yellow-600";
  };

  useEffect(() => {
    // 인증 로딩 상태와 관계없이 게시글 목록은 항상 불러옵니다.
    fetchPosts();
    // 인기 게시글도 인증 없이 조회 가능
    fetchPopularPosts();
  }, []); // authLoading 의존성 배열에서 제거

  // 페이지 로딩 중일 때
  if (loading) {
    return (
      <div className="pb-10">
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">로딩 중...</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 로그인 상태와 관계없이 항상 게시글 목록을 보여줍니다.
  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex gap-3 mb-4">
              <input 
                type="text" 
                placeholder="게시글 제목으로 검색하세요..." 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">검색</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#인기게시글</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#신규등록</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#가격대별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#카테고리별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#판매중</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Link href={`/patents/${post.id}`} key={post.id}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                    <div className={`${getBgColor(post.category)} rounded-full w-10 h-10 flex items-center justify-center mb-3`}>
                      <span className={`${getTextColor(post.category)} text-lg`}>{getEmoji(post.category)}</span>
                    </div>
                    <h3 className="font-bold text-[#1a365d] mb-2 text-sm">{post.title}</h3>
                    <p className="text-gray-600 text-xs mb-3">특허 기술에 대한 상세한 설명이 포함됩니다.</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base text-[#1a365d]">₩{post.price.toLocaleString()}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">판매중</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3">작성자</p>
                    <div className="flex gap-2 items-center">
                      <button 
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                      >
                        {post.isLiked ? '❤️' : '🤍'}
                      </button>
                      <span className="text-gray-500 text-xs">{post.favoriteCnt}</span>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}