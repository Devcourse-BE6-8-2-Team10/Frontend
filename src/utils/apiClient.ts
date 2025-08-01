import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ChatMessage, ChatRoom } from "./websocket";

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 자동으로 토큰 추가
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
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
  getChatRoom: async (roomId: string): Promise<ChatRoom> => {
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
  joinChatRoom: async (roomId: string): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/join`);
  },

  // 채팅방 나가기
  leaveChatRoom: async (roomId: string): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/leave`);
  },

  // 채팅 메시지 히스토리 조회
  getChatHistory: async (
    roomId: string,
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

  // 메시지 읽음 처리
  markMessageAsRead: async (
    roomId: string,
    messageId: string
  ): Promise<void> => {
    await apiClient.put(`/api/chat/rooms/${roomId}/messages/${messageId}/read`);
  },

  // 읽지 않은 메시지 수 조회
  getUnreadMessageCount: async (roomId: string): Promise<number> => {
    const response = await apiClient.get(
      `/api/chat/rooms/${roomId}/unread-count`
    );
    return response.data;
  },

  // 사용자별 읽지 않은 메시지 수 조회
  getAllUnreadMessageCount: async (): Promise<{ [roomId: string]: number }> => {
    const response = await apiClient.get("/api/chat/unread-counts");
    return response.data;
  },

  // 채팅방 검색
  searchChatRooms: async (query: string): Promise<ChatRoom[]> => {
    const response = await apiClient.get("/api/chat/rooms/search", {
      params: { q: query },
    });
    return response.data;
  },

  // 1:1 채팅방 생성 또는 조회
  getOrCreatePrivateChat: async (otherUserId: string): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/private", { otherUserId });
    return response.data;
  },
};

export default apiClient;
