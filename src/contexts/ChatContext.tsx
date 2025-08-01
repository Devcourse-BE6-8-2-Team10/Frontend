"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ChatMessage, ChatRoom, webSocketService } from "../utils/websocket";
import { useAuth } from "./AuthContext";

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
  sendMessage: (content: string) => void;
  createTestRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
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
      
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isLoading: false,
        // 테스트용 방 생성
        rooms: [
          {
            id: "test-room-1",
            name: "일반 채팅방",
            participants: [user.email]
          },
          {
            id: "test-room-2", 
            name: "기술 논의",
            participants: [user.email]
          }
        ]
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
    if (!state.isConnected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    // 이전 방 구독 해제
    if (state.currentRoom) {
      webSocketService.unsubscribeFromChatRoom(state.currentRoom.id);
    }

    // 새 방 구독
    webSocketService.subscribeToChatRoom(room.id, (message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    });

    setState(prev => ({
      ...prev,
      currentRoom: room,
      messages: [] // 새 방 선택시 메시지 초기화
    }));

    console.log(`방 선택: ${room.name}`);
  }, [state.isConnected, state.currentRoom]);

  // 메시지 전송
  const sendMessage = useCallback((content: string) => {
    if (!user || !state.currentRoom || !state.isConnected) {
      console.error("메시지 전송 조건이 맞지 않습니다.");
      return;
    }

    const message: Omit<ChatMessage, "id" | "timestamp"> = {
      senderId: user.id,
      senderName: user.name,
      content,
      roomId: state.currentRoom.id,
    };

    webSocketService.sendMessage(state.currentRoom.id, message);
  }, [user, state.currentRoom, state.isConnected]);

  // 테스트용 방 생성
  const createTestRoom = useCallback(() => {
    if (!user) return;
    
    const newRoom: ChatRoom = {
      id: `test-room-${Date.now()}`,
      name: `새 채팅방 ${new Date().toLocaleTimeString()}`,
      participants: [user.email]
    };

    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  }, [user]);

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
