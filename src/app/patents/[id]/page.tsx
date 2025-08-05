'use client';

import React, { useState, useEffect } from 'react';
import apiClient, { tradeAPI } from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// =================================================================
//  타입 정의 (Interfaces)
// =================================================================

interface FileUploadResponse {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  sortOrder: number;
}

interface PostDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  favoriteCnt: number;
  isLiked: boolean;
  createdAt: string;
  modifiedAt: string;
  ownerName: string;
  abstract: string;
  files: FileUploadResponse[];
}

// API 에러를 위한 타입
interface ApiError {
  response?: {
    data?: {
      msg?: string;
    };
  };
}

// 채팅방 요약 정보를 위한 타입
interface ChatRoomSummary {
  id: number;
  postId: number;
  // 필요에 따라 다른 속성 추가 가능
}


// =================================================================
//  상수 및 헬퍼 함수
// =================================================================

const categoryNameMap: { [key: string]: string } = {
  PRODUCT: '물건발명',
  METHOD: '방법발명',
  USE: '용도발명',
  DESIGN: '디자인권',
  TRADEMARK: '상표권',
  COPYRIGHT: '저작권',
  ETC: '기타',
};

const emojiMap: { [key: string]: string } = {
  PRODUCT: '📦',
  METHOD: '⚙️',
  USE: '🛠️',
  DESIGN: '🎨',
  TRADEMARK: '™️',
  COPYRIGHT: '📝',
  ETC: '✨',
};

const colorMap: { [key: string]: { bg: string; text: string } } = {
  PRODUCT: { bg: 'bg-pink-100', text: 'text-pink-600' },
  METHOD: { bg: 'bg-blue-100', text: 'text-blue-600' },
  USE: { bg: 'bg-green-100', text: 'text-green-600' },
  DESIGN: { bg: 'bg-purple-100', text: 'text-purple-600' },
  TRADEMARK: { bg: 'bg-orange-100', text: 'text-orange-600' },
  COPYRIGHT: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  ETC: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
};

const fetchPostDetail = async (postId: string) => {
  const response = await apiClient.get(`/api/posts/${postId}`);
  const filesResponse = await apiClient.get(`/api/posts/${postId}/files`);
  const postData = response.data.data;
  const filesData = filesResponse.data.data || [];
  return { ...postData, abstract: postData.description, files: filesData };
};

const fetchFiles = async (postId: string): Promise<FileUploadResponse[]> => {
  try {
    const response = await apiClient.get(`/api/posts/${postId}/files`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch files for post ${postId}:`, error);
    return [];
  }
};

// =================================================================
//  컴포넌트
// =================================================================

export default function PatentDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { ensureConnected, refreshChatRooms } = useChat();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!authLoading && postId) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      const loadPostAndFiles = async () => {
        setLoading(true);
        try {
          const postData = await fetchPostDetail(postId);
          setPost(postData);
          const filesData = await fetchFiles(postId);
          const fullFileUrls = filesData.map((f) =>
            f.fileUrl.startsWith('http') ? f.fileUrl : `${apiClient.defaults.baseURL}${f.fileUrl}`
          );
          setFileUrls(fullFileUrls);
        } catch (error) {
          console.error('게시글 또는 파일 조회 실패:', error);
          setPost(null);
          setFileUrls([]);
        } finally {
          setLoading(false);
        }
      };
      loadPostAndFiles();
    }
  }, [authLoading, isAuthenticated, router, postId]);

  const handlePurchaseInquiry = async () => {
    if (!isAuthenticated || !post) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      await ensureConnected();
      const response = await apiClient.post(`/api/chat/rooms/${post.id}`);
      if (response.data.resultCode === "200") {
        const chatRoomId = response.data.data;
        await refreshChatRooms();
        setTimeout(() => router.push(`/chat?roomId=${chatRoomId}`), 300);
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } catch (e: unknown) { // 'any' 대신 'unknown' 사용
      const error = e as ApiError; // 정의된 타입으로 형변환
      console.error('채팅방 생성 실패:', error);
      if (error.response?.data?.msg?.includes('이미 존재')) {
        try {
          const roomsResponse = await apiClient.get('/api/chat/rooms/my');
          const rooms = roomsResponse.data.data;
          if (rooms && rooms.length > 0) {
            // 'any' 대신 'ChatRoomSummary' 타입 사용
            const existingRoom = rooms.find((room: ChatRoomSummary) => room.postId === post.id);
            if (existingRoom) {
              setTimeout(() => router.push(`/chat?roomId=${existingRoom.id}`), 300);
            } else {
              alert('관련 채팅방을 찾을 수 없습니다. 새로운 채팅방을 다시 시도해주세요.');
            }
          } else {
            alert('채팅방을 찾을 수 없습니다.');
          }
        } catch (findError) {
          console.error('채팅방 조회 실패:', findError);
          alert('채팅방 생성에 실패했습니다.');
        }
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const toggleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    if (!post || likeLoading) return;
    setLikeLoading(true);
    try {
      const endpoint = `/api/posts/${post.id}/favorite`;
      await (post.isLiked ? apiClient.delete(endpoint) : apiClient.post(endpoint));
      setPost((prev) =>
        prev ? { ...prev, isLiked: !prev.isLiked, favoriteCnt: prev.isLiked ? prev.favoriteCnt - 1 : prev.favoriteCnt + 1 } : null
      );
    } catch (error) {
      console.error('찜 토글 오류:', error);
    } finally {
      setLikeLoading(false);
    }
  };
  
  const handleBuy = async () => {
    if (!isAuthenticated || !post) {
      router.push('/login');
      return;
    }
    setIsBuying(true);
    try {
      await tradeAPI.createTrade(post.id);
      alert('구매가 완료되었습니다.');
      router.push('/mypage');
    } catch (e: unknown) { // 'any' 대신 'unknown' 사용
      const err = e as ApiError; // 정의된 타입으로 형변환
      alert(err?.response?.data?.msg || '거래 생성에 실패했습니다.');
    } finally {
      setIsBuying(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <div>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="text-xl">게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const categoryStyle = colorMap[post.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-400 text-sm mb-6">
            <Link href="/" className="hover:text-gray-200">홈</Link>
            &nbsp;&gt;&nbsp;
            <Link href="/patents" className="hover:text-gray-200">특허목록</Link>
            &nbsp;&gt;&nbsp;
            <span>특허 상세</span>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="relative w-full h-64 md:h-80 mb-6 bg-gray-200 rounded-lg overflow-hidden">
              {fileUrls.length > 0 ? (
                <>
                  <Image src={fileUrls[currentImageIndex]} alt={`Patent image ${currentImageIndex + 1}`} layout="fill" objectFit="cover" priority />
                  {fileUrls.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex((p) => (p === 0 ? fileUrls.length - 1 : p - 1))} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10">&#10094;</button>
                      <button onClick={() => setCurrentImageIndex((p) => (p === fileUrls.length - 1 ? 0 : p + 1))} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10">&#10095;</button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className={`${categoryStyle.bg} rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0`}>
                <span className={`${categoryStyle.text} text-2xl`}>{emojiMap[post.category] || '❓'}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1a365d] mb-2">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-bold text-xl text-[#1a365d]">₩{post.price ? post.price.toLocaleString() : '가격 정보 없음'}</span>
                  <span className={`${post.status === 'SALE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-3 py-1 rounded-full`}>
                    {post.status === 'SALE' ? '판매중' : '판매완료'}
                  </span>
                  <span className="text-gray-500">찜: {post.favoriteCnt}</span>
                  <span className="text-gray-500">작성자: {post.ownerName || '정보 없음'}</span>
                  <span className="text-gray-500">기술분야: {categoryNameMap[post.category] || post.category}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-[#1a365d] mb-3">내용</h3>
              <p className="text-gray-700 leading-relaxed">{post.abstract}</p>
            </div>

            {post.files && post.files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-[#1a365d] mb-3">첨부 파일</h3>
                <ul className="list-disc list-inside space-y-2">
                  {post.files.map((file) => (
                    <li key={file.id} className="text-gray-700">
                      <a href={file.fileUrl.startsWith('http') ? file.fileUrl : `${apiClient.defaults.baseURL}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {file.fileName} ({Math.round(file.fileSize / 1024)} KB)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {post.status === 'SALE' ? (
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleBuy} disabled={isBuying}>
                  {isBuying ? '구매 요청 중...' : '구매하기'}
                </button>
              ) : (
                <button className="bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex-1 cursor-not-allowed" disabled>판매 완료</button>
              )}
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handlePurchaseInquiry} disabled={isCreatingRoom}>
                {isCreatingRoom ? '채팅방 생성 중...' : '구매 문의'}
              </button>
              <button className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition-colors flex-1" onClick={toggleLike} disabled={likeLoading}>
                {post.isLiked ? '❤️ 찜하기 취소' : '🤍 찜하기'}
              </button>
              <button className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors flex-1">공유하기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
