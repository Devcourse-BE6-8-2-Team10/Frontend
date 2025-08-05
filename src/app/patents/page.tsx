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
  imageUrl?: string;
}

const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${apiClient.defaults.baseURL}${url}`;
};

export default function PatentsPage() {
  const { isAuthenticated } = useAuth();
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체 카테고리");
  const [activeTag, setActiveTag] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popularRes, recentRes] = await Promise.all([
          apiClient.get('/api/posts/popular'),
          apiClient.get('/api/posts')
        ]);

        const popularData = popularRes.data.data.map((post: Post) => ({
          ...post,
          imageUrl: getFullImageUrl(post.imageUrl),
          isLiked: post.isLiked ?? false
        }));

        const recentData = recentRes.data.map((post: Post) => ({
          ...post,
          imageUrl: getFullImageUrl(post.imageUrl),
          isLiked: post.isLiked ?? false
        }));

        setPopularPosts(popularData.slice(0, 10));
        setRecentPosts(recentData);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (category: string) => {
    if (activeTag === category) {
      setActiveTag(null); // 이미 선택된 해시태그 클릭 시 해제
      setSelectedCategory("전체 카테고리");
    } else {
      setActiveTag(category);
      setSelectedCategory(category);
    }
 };


  const toggleLike = async (postId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const updateLike = (posts: Post[]) => posts.map(p =>
        p.id === postId ? { ...p, isLiked: !p.isLiked, favoriteCnt: p.isLiked ? p.favoriteCnt - 1 : p.favoriteCnt + 1 } : p
      );

      const post = [...popularPosts, ...recentPosts].find(p => p.id === postId);
      if (!post) return;

      const method = post.isLiked ? 'delete' : 'post';
      const response = await apiClient[method](`/api/likes/${postId}`);

      if (response.status === 200) {
        setPopularPosts(updateLike);
        setRecentPosts(updateLike);
      }
    } catch (error) {
      console.error('찜 토글 오류:', error);
    }
  };

  const filteredRecentPosts = recentPosts.filter(post => {
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
          {/* 검색 필터 */}
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
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                onClick={() => console.log('검색 버튼 클릭')}
              >
                검색
              </button>
            </div>
               <div className="flex gap-2 flex-wrap">
                 {categories.filter(c => c !== "전체 카테고리").map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        activeTag === category
                         ? 'bg-purple-600 text-white'
                         : 'bg-blue-100 text-[#1a365d] hover:bg-blue-200'
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      #{category}
                    </button>
                 ))}

                 {activeTag && (
                   <button
                     className="ml-2 text-sm text-red-500 hover:underline"
                     onClick={() => handleCategoryClick(activeTag)}
                   >
                    필터 해제 ✕
                   </button>
                 )}
               </div>
          </div>

          {/* 인기 게시글 */}
          <h2 className="text-2xl font-bold mb-4">🔥 인기 게시글 TOP 10</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {popularPosts.map(post => renderPostCard(post))}
          </div>

          {/* 최신 게시글 */}
          <h2 className="text-2xl font-bold mb-4">🆕 최신 게시글</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRecentPosts.length > 0 ? (
              filteredRecentPosts.map(post => renderPostCard(post))
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

  function renderPostCard(post: Post) {
    return (
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
    );
  }
}
