import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ChatMessage, ChatRoom } from "./websocket";
import { getAccessTokenCookie, clearAccessTokenCookie, clearRefreshTokenCookie } from './cookieUtils';

// =================================================================
//  타입 정의 (Interfaces)
// =================================================================

// 게시글(특허)에 대한 공통 인터페이스
export interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  createdAt: string;
  // API 응답에 따라 포함될 수 있는 추가 속성들
  summary?: string;
  author?: string;
  imageUrl?: string;
  thumbnailImageUrl?: string;
  favoriteCount?: number;
  viewCount?: number;
  updatedAt?: string;
  memberId?: number;
  memberName?: string;
  memberProfileImageUrl?: string;
  isFavorite?: boolean;
}

// 게시글 파일에 대한 인터페이스
export interface PostFile {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

// 회원 정보에 대한 인터페이스
export interface Member {
    id: number;
    email: string;
    name: string;
    role: string;
    profileUrl?: string;
    status: string;
    createdAt: string;
    modifiedAt?: string;
    deletedAt?: string;
}

// 거래 내역 요약 타입
export interface TradeDto {
  id: number;
  postId: number;
  sellerId: number;
  buyerId: number;
  price: number;
  status: string;
  createdAt: string;
}

// 거래 내역 상세 타입
export interface TradeDetailDto {
  id: number;
  postId: number;
  postTitle: string;
  postCategory: string;
  price: number;
  status: string;
  createdAt: string;
  sellerEmail: string;
  buyerEmail: string;
}


// =================================================================
//  Axios 인스턴스 및 인터셉터 설정
// =================================================================

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessTokenCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAccessTokenCookie();
        clearRefreshTokenCookie();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

// =================================================================
//  API 모듈
// =================================================================

export const chatAPI = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get("/api/chat/rooms");
    return response.data;
  },
  getChatRoom: async (roomId: number): Promise<ChatRoom> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}`);
    return response.data;
  },
  createChatRoom: async (roomData: { name: string; participants: string[] }): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/rooms", roomData);
    return response.data;
  },
  joinChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/join`);
  },
  leaveChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/leave`);
  },
  getChatHistory: async (roomId: number, page: number = 0, size: number = 50): Promise<{ messages: ChatMessage[]; hasMore: boolean; totalElements: number; }> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, { params: { page, size } });
    return response.data;
  },
  getOrCreatePrivateChat: async (otherUserId: string): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/private", { otherUserId });
    return response.data;
  },
  deleteChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.delete(`/api/chat/rooms/${roomId}`);
  },
};

export const patentAPI = {
  getRecentPatents: async (): Promise<Post[]> => {
    const response = await apiClient.get("/api/posts");
    return response.data;
  },
  getPopularPatents: async (): Promise<Post[]> => {
    const response = await apiClient.get("/api/posts/popular");
    return response.data;
  },
  getPostFiles: async (postId: number): Promise<PostFile[]> => {
    const response = await apiClient.get(`/api/posts/${postId}/files`);
    return response.data.data || [];
  },
  // 'any[]' 타입을 'Post[]'로 수정
  getMyPatents: async (): Promise<Post[]> => {
    const response = await apiClient.get("/api/posts/me");
    // API 응답 구조에 따라 실제 데이터가 data 속성 안에 있을 수 있음
    return response.data.data || response.data;
  },
  // 'any[]' 타입을 'Post[]'로 수정
  getLikedPatents: async (): Promise<Post[]> => {
    const response = await apiClient.get("/api/likes/me");
    // API 응답 구조에 따라 실제 데이터가 data 속성 안에 있을 수 있음
    return response.data.data || response.data;
  },
};

export const memberAPI = {
  updateMemberInfo: async (data: { name: string; currentPassword?: string; newPassword?: string; }): Promise<void> => {
    await apiClient.patch('/api/members/me', data);
  },
  getMyPageInfo: async (): Promise<Member> => {
    const response = await apiClient.get('/api/members/me');
    return response.data;
  },
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/api/members/me');
  },
  verifyMember: async (data: { name: string; email: string; }): Promise<void> => {
    const response = await fetch(`${apiClient.defaults.baseURL}/api/members/verify-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원 확인에 실패했습니다.');
    }
  },
  findAndUpdatePassword: async (data: { name: string; email: string; newPassword: string; confirmPassword: string; }): Promise<void> => {
    const response = await fetch(`${apiClient.defaults.baseURL}/api/members/find-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
    }
  },
};

export const tradeAPI = {
  getMyTrades: async (page: number = 0, size: number = 10): Promise<{ content: TradeDto[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean; }> => {
    const response = await apiClient.get("/api/trades", { params: { page, size } });
    return response.data.data;
  },
  getTradeDetail: async (tradeId: number): Promise<TradeDetailDto> => {
    const response = await apiClient.get(`/api/trades/${tradeId}`);
    return response.data.data;
  },
  createTrade: async (postId: number): Promise<void> => {
    await apiClient.post("/api/trades", { postId });
  },
};

export const adminAPI = {
  getAllMembers: async (): Promise<{ data: { content: Member[] } }> => {
    const response = await apiClient.get('/api/admin/members');
    return response.data;
  },
  getMemberDetail: async (memberId: number): Promise<{ data: Member }> => {
    const response = await apiClient.get(`/api/admin/members/${memberId}`);
    return response.data;
  },
  updateMemberByAdmin: async (memberId: number, data: { name?: string; status?: string; profileUrl?: string | null; }): Promise<void> => {
    await apiClient.patch(`/api/admin/members/${memberId}`, data);
  },
  deleteMemberByAdmin: async (memberId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/members/${memberId}`);
  },
  getAllPatents: async (): Promise<{ data: { content: Post[] } }> => {
    const response = await apiClient.get('/api/admin/patents');
    return response.data;
  },
  updatePatentByAdmin: async (patentId: number, data: { title?: string; description?: string; category?: string; price?: number; }): Promise<void> => {
    await apiClient.patch(`/api/admin/patents/${patentId}`, data);
  },
  getPatentDetail: async (patentId: number): Promise<{ data: Post }> => {
    const response = await apiClient.get(`/api/admin/patents/${patentId}`);
    return response.data;
  },
  deletePatentByAdmin: async (patentId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/patents/${patentId}`);
  },
};

export default apiClient;
