'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

interface FileUploadResponse {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  sortOrder: number;
}

// Post 상세 정보 타입 정의 (백엔드 PostDetailDTO.java 참고)
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
  owner: string; // 예시 데이터, 실제로는 User 정보가 필요
  patentNumber: string; // 예시 데이터
  applicationDate: string;
  publicationDate: string;
  registrationDate: string;
  mainClass: string; // 예시 데이터
  subClass: string; // 예시 데이터
  techField: string; // 예시 데이터
  abstract: string;
  files: FileUploadResponse[]; // 파일 목록 추가
}

// 카테고리에 따른 이모지, 배경색, 텍스트색 매핑
// Post.java의 Category enum 참고
const emojiMap: { [key: string]: string } = {
  PRODUCT: '💡',
  METHOD: '🧠',
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

  const postData = response.data.data;
  const filesData = filesResponse.data.data || [];

  return {
    ...postData,
    owner: '김발명가',
    patentNumber: `KR-2024-${String(postData.id).padStart(6, '0')}`,
    applicationDate:
      postData.createdAt ?
      new Date(postData.createdAt).toLocaleDateString('ko-KR') :
      'N/A',
    publicationDate:
      postData.createdAt ?
      new Date(postData.createdAt).toLocaleDateString('ko-KR') :
      'N/A',
    registrationDate:
      postData.modifiedAt ?
      new Date(postData.modifiedAt).toLocaleDateString('ko-KR') :
      'N/A',
    mainClass: 'G10L 15/00',
    subClass: 'G10L 15/22',
    techField: 'AI/음성인식',
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState<any>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

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
                return `${apiClient.defaults.baseURL}${f.fileUrl}`;
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
      const endpoint = `/api/posts/${post.id}/favorite`;
      const response =
        post.isLiked ?
        await apiClient.delete(endpoint) :
        await apiClient.post(endpoint);

      if (response.status === 200) {
        setPost((prevPost: any) => ({
          ...prevPost,
          isLiked: !prevPost.isLiked,
          favoriteCnt:
            prevPost.isLiked ? prevPost.favoriteCnt - 1 : prevPost.favoriteCnt + 1,
        }));
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
                <p className="text-gray-600 mb-4">{post.description}</p>
                <div className="flex flex-wrap items-center gap-4">
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
                    } px-3 py-1 rounded-full text-sm`}
                  >
                    {post.status}
                  </span>
                  <span className="text-gray-500">
                    찜 수: {post.favoriteCnt}
                  </span>
                  <span className="text-gray-500">소유자: {post.owner}</span>
                </div>
              </div>
            </div>

            {/* Patent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-[#1a365d] mb-3">특허 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">특허번호:</span>
                    <span>{post.patentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">출원일:</span>
                    <span>{post.applicationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">공개일:</span>
                    <span>{post.publicationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">등록일:</span>
                    <span>{post.registrationDate}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#1a365d] mb-3">기술 분야</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주분류:</span>
                    <span>{post.mainClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">부분류:</span>
                    <span>{post.subClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">기술분야:</span>
                    <span>{post.techField}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <h3 className="font-bold text-[#1a365d] mb-3">요약</h3>
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
                        href={file.fileUrl.startsWith('http') ? file.fileUrl : `${apiClient.defaults.baseURL}${file.fileUrl}`}
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex-1">
                구매 문의
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
          </div>
        </div>
      </section>
    </div>
  );
}
