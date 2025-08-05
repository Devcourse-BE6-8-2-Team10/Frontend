'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import Link from 'next/link';

interface LikedPost {
  id: number;
  title: string;
  category: string;
  price: number;
  favoriteCnt: number;
  imageUrl?: string;
}

export default function LikedPostsPage() {
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await apiClient.get('/api/likes/me');
        setLikedPosts(response.data);
      } catch (error) {
        console.error('찜 게시물 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">로딩 중...</div>;
  }

  if (likedPosts.length === 0) {
    return <div className="text-center py-20 text-gray-500">찜한 게시물이 없습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">내가 찜한 게시물</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedPosts.map(post => (
          <Link href={`/patents/${post.id}`} key={post.id}>
            <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-sm text-gray-500">{post.category}</p>
              <p className="text-sm text-gray-500">₩{post.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500">찜 {post.favoriteCnt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
