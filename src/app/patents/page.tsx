"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  status?: string;
  favoriteCnt: number;
  isLiked?: boolean;
  createdAt: string;
  modifiedAt?: string;
  imageUrl?: string; // 이미지 URL 필드 추가
}

// URL을 처리하는 헬퍼 함수
const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // 이미 절대 URL인 경우 그대로 반환
  }
  return `${apiClient.defaults.baseURL}${url}`; // 상대 URL인 경우 baseURL 추가
};

export default function PatentsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<Post[]>('/api/posts');
        const postsWithFullImageUrl = response.data.map(post => ({
          ...post,
          imageUrl: getFullImageUrl(post.imageUrl),
          isLiked: post.isLiked ?? false
        }));
        setPosts(postsWithFullImageUrl);
      } catch (error: any) {
        console.error('게시글 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 찜 등록/해제 (로그인 필요)
  const toggleLike = async (postId: number) => {
    if (!isAuthenticated) {
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
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col h-full">
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      {post.imageUrl ? (
                        <Image src={post.imageUrl} alt={post.title} width={300} height={200} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-bold text-[#1a365d] mb-2 text-sm flex-grow">{post.title}</h3>
                      <div className="flex justify-between items-center mb-2 mt-auto">
                        <span className="font-bold text-base text-[#1a365d]">₩{post.price.toLocaleString()}</span>
                        {post.status && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{post.status}</span>}
                      </div>
                      <div className="flex gap-2 items-center mt-2">
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