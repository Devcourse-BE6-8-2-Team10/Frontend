"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { ChatMessage, ChatRoom, webSocketService } from "../utils/websocket";
import { useAuth } from "./AuthContext";
import { getAccessTokenCookie } from "../utils/cookieUtils";

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ChatContextType extends ChatState {
  connectToChat: () => Promise<void>;
  disconnectFromChat: () => void;
  selectRoom: (room: ChatRoom) => void;
  sendMessage: (content: string) => Promise<void>;
  createTestRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ChatState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // WebSocket 연결
  const connectToChat = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, error: "로그인이 필요합니다." }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await webSocketService.connect(user.email);

      // 수동으로 토큰을 헤더에 추가
      const token = getAccessTokenCookie();
      console.log("=== 채팅 연결 디버깅 ===");
      console.log("토큰 존재 여부:", !!token);
      console.log("토큰 앞 20자:", token ? token.substring(0, 20) + "..." : "없음");
      console.log("사용자 정보:", user);
      console.log("전체 쿠키 문자열:", document.cookie);
      console.log("accessToken 쿠키 직접 확인:", document.cookie.includes('accessToken'));

      // 모든 쿠키 파싱해서 보기
      const allCookies = document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        cookies[name] = value;
        return cookies;
      }, {} as Record<string, string>);
      console.log("파싱된 모든 쿠키:", allCookies);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log("요청 헤더:", headers);

      const response = await fetch('http://localhost:8080/api/chat/rooms/my', {
        method: 'GET',
        headers,
        credentials: 'include' // 쿠키도 함께 전송
      });

      if (!response.ok) {
        throw new Error(`채팅방 목록을 불러올 수 없습니다. (${response.status})`);
      }

      const responseData = await response.json();
      const roomsData = responseData.data;
      console.log("서버에서 받은 채팅방 데이터:", roomsData);

      // 서버 응답이 배열인지 확인하고 처리
      let rooms = [];
      if (Array.isArray(roomsData)) {
        rooms = roomsData;
      } else if (roomsData && Array.isArray(roomsData.data)) {
        rooms = roomsData.data;
      } else if (roomsData && roomsData.rooms && Array.isArray(roomsData.rooms)) {
        rooms = roomsData.rooms;
      } else {
        console.warn("서버에서 받은 데이터가 배열 형태가 아닙니다:", roomsData);
      }

      // 중복 채팅방 제거 (같은 ID를 가진 방이 여러 개 있을 경우)
      const uniqueRooms = rooms.reduce((acc: any[], current: any) => {
        const existing = acc.find(room => room.id === current.id);
        if (!existing) {
          acc.push(current);
        } else {
          console.warn(`중복된 채팅방 ID 발견: ${current.id}, 기존 방 유지`);
        }
        return acc;
      }, []);

      console.log("중복 제거 후 채팅방 목록:", uniqueRooms);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        rooms: uniqueRooms
      }));

      console.log("채팅 연결 완료");
    } catch (error) {
      console.error("채팅 연결 실패:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "연결 실패",
        isLoading: false,
        isConnected: false
      }));
    }
  }, [user, isAuthenticated]);

  // WebSocket 연결 해제
  const disconnectFromChat = useCallback(() => {
    console.log("=== 채팅 연결 해제 ===");
    webSocketService.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      currentRoom: null,
      messages: []
    }));
  }, []);

  // 채팅방 선택
  const selectRoom = useCallback((room: ChatRoom) => {
    console.log("selectRoom 호출:", room.name, "ID:", room.id);
    
    setState(prev => {
      if (!prev.isConnected) {
        console.error("WebSocket이 연결되지 않았습니다.");
        return prev;
      }

      // 같은 방을 다시 선택하는 경우 무시
      if (prev.currentRoom && prev.currentRoom.id === room.id) {
        console.log("이미 선택된 방입니다.");
        return prev;
      }

      console.log(`새 채팅방 ${room.id} 구독 시작`);
      webSocketService.subscribeToChatRoom(room.id, (message) => {
        console.log("ChatContext에서 메시지 수신:", message);
        setState(prevState => {
          console.log("메시지를 상태에 추가:", message.content);
          return {
            ...prevState,
            messages: [...prevState.messages, message]
          };
        });
      });

      console.log(`방 선택 완료: ${room.name}`);
      
      return {
        ...prev,
        currentRoom: room,
        messages: [] // 새 방 선택시 메시지 초기화
      };
    });
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string) => {
    console.log("=== ChatContext sendMessage 호출 ===");
    console.log("content:", content);
    console.log("user:", user);

    if (!user) {
      console.error("❌ 사용자 정보가 없습니다.");
      throw new Error("사용자 정보가 없습니다.");
    }

    // state를 직접 읽어서 조건 확인
    if (!state.currentRoom || !state.isConnected) {
      console.error("❌ 메시지 전송 조건이 맞지 않습니다.");
      console.error("currentRoom:", state.currentRoom);
      console.error("isConnected:", state.isConnected);
      throw new Error("메시지 전송 조건이 맞지 않습니다.");
    }

    try {
      const message: Omit<ChatMessage, "id" | "timestamp"> = {
        senderId: user.id,
        senderName: user.name,
        content,
        senderEmail: user.email,
        roomId: state.currentRoom.id,
      };

      console.log("생성된 message 객체:", message);

      // WebSocket으로 메시지 전송 (백엔드에서 저장 및 분배 처리)
      console.log("webSocketService.sendMessage 호출...");
      webSocketService.sendMessage(state.currentRoom.id, message);

      console.log("✅ 메시지 전송 완료");
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      throw error;
    }
  }, [user, state.currentRoom, state.isConnected]);

  // 테스트용 방 생성
  const createTestRoom = useCallback(() => {
    if (!user) return;

    const newRoom: ChatRoom = {
      id: Date.now(), // 임시 ID, 실제로는 서버에서 생성된 ID 사용
      name: `새 채팅방 ${new Date().toLocaleTimeString()}`,
      participants: [user.email]
    };

    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  }, [user]);

  // URL 파라미터로 전달된 roomId 처리 - 단순화
  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    
    // 한 번만 실행되도록 체크
    if (roomIdFromUrl && state.rooms.length > 0 && state.isConnected && !state.currentRoom) {
      const targetRoom = state.rooms.find(room => room.id === Number(roomIdFromUrl));
      if (targetRoom) {
        console.log("URL 파라미터로 채팅방 자동 선택:", targetRoom.name);
        selectRoom(targetRoom);
      }
    }
  }, [searchParams, state.rooms, state.isConnected, state.currentRoom, selectRoom]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnectFromChat();
    };
  }, [disconnectFromChat]);

  const value: ChatContextType = {
    ...state,
    connectToChat,
    disconnectFromChat,
    selectRoom,
    sendMessage,
    createTestRoom,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
