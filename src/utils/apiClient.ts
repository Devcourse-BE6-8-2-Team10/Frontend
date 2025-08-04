import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ChatMessage, ChatRoom } from "./websocket";
import { getAccessTokenCookie, clearAccessTokenCookie, clearRefreshTokenCookie } from './cookieUtils';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 자동으로 AccessToken 추가 (쿠키에서 읽어옴)
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessTokenCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // 401/403 에러 시 자동 로그아웃 처리
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAccessTokenCookie();
        clearRefreshTokenCookie();
        // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

// 채팅 관련 API 함수들
export const chatAPI = {
  // 채팅방 목록 조회
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get("/api/chat/rooms");
    return response.data;
  },

  // 특정 채팅방 조회
  getChatRoom: async (roomId: number): Promise<ChatRoom> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}`);
    return response.data;
  },

  // 채팅방 생성
  createChatRoom: async (roomData: {
    name: string;
    participants: string[];
  }): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/rooms", roomData);
    return response.data;
  },

  // 채팅방 참여
  joinChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/join`);
  },

  // 채팅방 나가기
  leaveChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/leave`);
  },

  // 채팅 메시지 히스토리 조회
  getChatHistory: async (
    roomId: number,
    page: number = 0,
    size: number = 50
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    totalElements: number;
  }> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, {
      params: { page, size },
    });
    return response.data;
  },

  // 1:1 채팅방 생성 또는 조회
  getOrCreatePrivateChat: async (otherUserId: string): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/private", { otherUserId });
    return response.data;
  },
};

// 특허 관련 API 함수들
export const patentAPI = {
  // 최근 등록된 특허 목록 조회
  getRecentPatents: async (): Promise<any[]> => {
    const response = await apiClient.get("/api/posts");
    return response.data;
  },

  // 인기 특허 목록 조회
  getPopularPatents: async (): Promise<any[]> => {
    const response = await apiClient.get("/api/posts/popular");
    return response.data;
  },

  // 특정 게시글의 파일 목록 조회
  getPostFiles: async (postId: number): Promise<any[]> => {
    const response = await apiClient.get(`/api/posts/${postId}/files`);
    return response.data.data || []; // 데이터 구조에 따라 .data를 추가
  },
};

// 회원 관련 API 함수들
export const memberAPI = {
  // 회원 정보 수정
  updateMemberInfo: async (data: {
    name: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<void> => {
    await apiClient.patch('/api/members/me', data);
  },

  // 마이페이지 정보 조회
  getMyPageInfo: async (): Promise<any> => {
    const response = await apiClient.get('/api/members/me');
    return response.data;
  },

  // 회원 탈퇴
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/api/members/me');
  },
};

export default apiClient;
