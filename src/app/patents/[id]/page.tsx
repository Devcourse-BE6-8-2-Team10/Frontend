'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useParams, useRouter } from 'next/navigation';

const statusMap: { [key: string]: string } = {
  SALE: '판매중',
  SOLD_OUT: '판매완료'
};

interface FileUploadResponse {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  sortOrder: number;
}

// Post 상세 정보 타입 정의 (실제 API 응답 기준)
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
  ownerName: string; // 작성자 이름 필드
  abstract: string;
  files: FileUploadResponse[];
}

// 카테고리 영문 key를 한글로 변환하기 위한 맵
const categoryNameMap: { [key: string]: string } = {
  PRODUCT: '물건발명',
  METHOD: '방법발명',
  USE: '용도발명',
  DESIGN: '디자인권',
  TRADEMARK: '상표권',
  COPYRIGHT: '저작권',
  ETC: '기타',
};

// 카테고리에 따른 이모지, 배경색, 텍스트색 매핑
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

// API 호출 함수
const fetchPostDetail = async (postId: string) => {
  const response = await apiClient.get(`/api/posts/${postId}`);
  const filesResponse = await apiClient.get(`/api/posts/${postId}/files`);

  const postData = response.data.data || response.data;
  const filesData = filesResponse.data.data || [];

  return {
    ...postData,
    abstract: postData.description,
    files: filesData,
  };
};

const fetchFiles = async (postId: string) => {
  try {
    const response = await apiClient.get(`/api/posts/${postId}/files`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch files for post ${postId}:`, error);
    return [];
  }
};

export default function PatentDetailPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { ensureConnected } = useChat(); // 연결 보장 함수 추가
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (postId) {
        const loadPostAndFiles = async () => {
          setLoading(true);
          try {
            const postData = await fetchPostDetail(postId as string);
            setPost(postData);

            const filesData = await fetchFiles(postId as string);
            const fullFileUrls = filesData.map((f: any) => {
                if (f.fileUrl.startsWith('http')) {
                    return f.fileUrl;
                }
                return `${apiClient.defaults.baseURL || ''}${f.fileUrl}`;
            });
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
    }
  }, [authLoading, isAuthenticated, router, postId]);

 const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/api/posts/${post?.id}`);
      alert('게시글이 삭제되었습니다.');
      router.push('/patents');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 구매 문의 기능
  const handlePurchaseInquiry = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    // 이미 채팅방 생성 중이면 중복 호출 방지
    if (isCreatingRoom) {
      console.log('이미 채팅방 생성 중입니다.');
      return;
    }

    setIsCreatingRoom(true);

    try {
      // WebSocket 연결 확인 및 자동 연결
      console.log("구매 문의 - WebSocket 연결 확인");
      await ensureConnected();

      // 백엔드 API 호출하여 채팅방 생성 또는 기존 채팅방 ID 반환
      const response = await apiClient.post(`/api/chat/rooms/${post.id}`);

      if (response.data.resultCode === "200") {
        const chatRoomId = response.data.data;
        console.log("채팅방 ID:", chatRoomId);

        // 채팅 페이지로 이동하면서 roomId를 쿼리 파라미터로 전달
        router.push(`/chat?roomId=${chatRoomId}`);
      } else {
        alert('채팅방 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      if (error.response?.data?.msg && typeof error.response.data.msg === 'string' && error.response.data.msg.includes('이미 존재')) {
        // 이미 채팅방이 존재하는 에러인 경우, 기존 채팅방을 찾아서 이동
        try {
          const roomsResponse = await apiClient.get('/api/chat/rooms/my');
          const rooms = roomsResponse.data.data;
          // 해당 게시글과 관련된 채팅방 찾기 (임시로 가장 최근 채팅방으로 이동)
          if (rooms && rooms.length > 0) {
            router.push(`/chat?roomId=${rooms[0].id}`);
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

  // 찜 등록/해제 기능
  const toggleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
      return;
    }
    if (!post || likeLoading) return;
    setLikeLoading(true);

    try {
      const endpoint = `/api/likes/${post.id}`;
      const response =
        post.isLiked ?
        await apiClient.delete(endpoint) :
        await apiClient.post(endpoint);

      if (response.status === 200) {
        setPost((prevPost) =>
          prevPost
            ? {
                ...prevPost,
                isLiked: !prevPost.isLiked,
                favoriteCnt: prevPost.isLiked
                  ? prevPost.favoriteCnt - 1
                  : prevPost.favoriteCnt + 1,
              }
            : null
        );
      }
    } catch (error) {
      console.error('찜 토글 오류:', error);
    } finally {
      setLikeLoading(false);
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

  const categoryStyle =
    colorMap[post.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-gray-400 text-sm mb-6">
            <a href="/" className="hover:text-gray-200">
              홈
            </a>
            &gt;
            <a href="/patents" className="hover:text-gray-200">
              특허목록
            </a>
            &gt;
            <span>특허 상세</span>
          </div>

          {/* Patent Detail Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            {/* Image Slider */}
            <div className="relative w-full h-64 mb-6 bg-gray-200 rounded-lg overflow-hidden">
              {fileUrls.length > 0 ? (
                <>
                  <img
                    src={fileUrls[currentImageIndex]}
                    alt={`Patent image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {fileUrls.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? fileUrls.length - 1 : prev - 1
                          )
                        }
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                      >
                        &#10094;
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === fileUrls.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                      >
                        &#10095;
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              <div
                className={`${categoryStyle.bg} rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0`}
              >
                <span className={`${categoryStyle.text} text-2xl`}>
                  {emojiMap[post.category] || '❓'}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1a365d] mb-2">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-bold text-xl text-[#1a365d]">
                    ₩
                    {post.price ?
                      post.price.toLocaleString() :
                      '가격 정보 없음'}
                  </span>
                  <span
                    className={`${
                      post.status === 'SALE' ?
                        'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    } px-3 py-1 rounded-full`}
                  >
                    {statusMap[post.status] || post.status}
                  </span>
                  <span className="text-gray-500">
                    찜: {post.favoriteCnt}
                  </span>
                   <span className="text-gray-500">
                    작성자: {post.ownerName || '정보 없음'}
                  </span>
                  <span className="text-gray-500">
                    기술분야: {categoryNameMap[post.category] || post.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <h3 className="font-bold text-[#1a365d] mb-3">내용</h3>
              <p className="text-gray-700 leading-relaxed">
                {post.abstract}
              </p>
            </div>

            {/* Attached Files */}
            {post.files && post.files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-[#1a365d] mb-3">첨부 파일</h3>
                <ul className="list-disc list-inside space-y-2">
                  {post.files.map((file: any) => (
                    <li key={file.id} className="text-gray-700">
                      <a
                        href={file.fileUrl.startsWith('http') ? file.fileUrl : `${apiClient.defaults.baseURL || ''}${file.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.fileName} ({Math.round(file.fileSize / 1024)} KB)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePurchaseInquiry}
                disabled={isCreatingRoom}
              >
                {isCreatingRoom ? '채팅방 생성 중...' : '구매 문의'}
              </button>
              <button
                className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition-colors flex-1"
                onClick={toggleLike}
                disabled={likeLoading}
              >
                {post.isLiked ? '❤️ 찜하기 취소' : '🤍 찜하기'}
              </button>
              <button className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors flex-1">
                공유하기
              </button>
            </div>
            {user?.name === post.ownerName && (
              <div className="flex gap-4 mt-6">
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  onClick={() => router.push(`/patents/${post.id}/edit`)}
                >
                  수정하기
                </button>
                <button
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                  onClick={handleDelete}
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
