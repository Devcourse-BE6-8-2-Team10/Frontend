"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ChatMessage, ChatRoom, webSocketService } from "../utils/websocket";
import { chatAPI } from "../utils/apiClient";

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  unreadCounts: { [roomId: string]: number };
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: "SET_ROOMS"; payload: ChatRoom[] }
  | { type: "SET_CURRENT_ROOM"; payload: ChatRoom | null }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_UNREAD_COUNTS"; payload: { [roomId: string]: number } }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "UPDATE_ROOM_LAST_MESSAGE";
      payload: { roomId: string; message: ChatMessage };
    };

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  unreadCounts: {},
  isConnected: false,
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_ROOMS":
      return { ...state, rooms: action.payload };
    case "SET_CURRENT_ROOM":
      return { ...state, currentRoom: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_UNREAD_COUNTS":
      return { ...state, unreadCounts: action.payload };
    case "SET_CONNECTION_STATUS":
      return { ...state, isConnected: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_ROOM_LAST_MESSAGE":
      return {
        ...state,
        rooms: state.rooms.map((room) =>
          room.id === action.payload.roomId
            ? { ...room, lastMessage: action.payload.message }
            : room
        ),
      };
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  connect: () => Promise<void>;
  disconnect: () => void;
  loadRooms: () => Promise<void>;
  selectRoom: (room: ChatRoom) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createRoom: (name: string, participants: string[]) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  loadChatHistory: (roomId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // WebSocket 연결
  const connect = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const token = localStorage.getItem("accessToken");
      await webSocketService.connect(token || undefined);

      dispatch({ type: "SET_CONNECTION_STATUS", payload: true });

      // 연결 후 채팅방 목록 로드
      try {
        const rooms = await chatAPI.getChatRooms();
        dispatch({ type: "SET_ROOMS", payload: rooms });

        // 읽지 않은 메시지 수 로드
        const unreadCounts = await chatAPI.getAllUnreadMessageCount();
        dispatch({ type: "SET_UNREAD_COUNTS", payload: unreadCounts });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "채팅방 목록 로드 실패",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "연결 실패",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // WebSocket 연결 해제
  const disconnect = () => {
    webSocketService.disconnect();
    dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
  };

  // 채팅방 목록 로드
  const loadRooms = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const rooms = await chatAPI.getChatRooms();
      dispatch({ type: "SET_ROOMS", payload: rooms });

      // 읽지 않은 메시지 수 로드
      const unreadCounts = await chatAPI.getAllUnreadMessageCount();
      dispatch({ type: "SET_UNREAD_COUNTS", payload: unreadCounts });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "채팅방 목록 로드 실패",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // 채팅방 선택
  const selectRoom = async (room: ChatRoom) => {
    try {
      dispatch({ type: "SET_CURRENT_ROOM", payload: room });
      await loadChatHistory(room.id);

      // 해당 채팅방 구독
      if (state.isConnected) {
        webSocketService.subscribeToChatRoom(room.id, (message) => {
          dispatch({ type: "ADD_MESSAGE", payload: message });
          dispatch({
            type: "UPDATE_ROOM_LAST_MESSAGE",
            payload: { roomId: room.id, message },
          });
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "채팅방 선택 실패",
      });
    }
  };

  // 메시지 전송
  const sendMessage = async (content: string) => {
    if (!state.currentRoom) return;

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const message: Omit<ChatMessage, "id" | "timestamp"> = {
        senderId: userData.id,
        senderName: userData.name || userData.username,
        content,
        roomId: state.currentRoom.id,
      };

      webSocketService.sendMessage(state.currentRoom.id, message);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "메시지 전송 실패",
      });
    }
  };

  // 채팅방 생성
  const createRoom = async (name: string, participants: string[]) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newRoom = await chatAPI.createChatRoom({ name, participants });
      dispatch({ type: "SET_ROOMS", payload: [...state.rooms, newRoom] });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "채팅방 생성 실패",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // 채팅방 참여
  const joinRoom = async (roomId: string) => {
    try {
      await chatAPI.joinChatRoom(roomId);
      await loadRooms(); // 목록 새로고침
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "채팅방 참여 실패",
      });
    }
  };

  // 채팅방 나가기
  const leaveRoom = async (roomId: string) => {
    try {
      await chatAPI.leaveChatRoom(roomId);
      await loadRooms(); // 목록 새로고침

      // 현재 채팅방이면 선택 해제
      if (state.currentRoom?.id === roomId) {
        dispatch({ type: "SET_CURRENT_ROOM", payload: null });
        dispatch({ type: "SET_MESSAGES", payload: [] });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "채팅방 나가기 실패",
      });
    }
  };

  // 채팅 히스토리 로드
  const loadChatHistory = async (roomId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { messages } = await chatAPI.getChatHistory(roomId);
      dispatch({ type: "SET_MESSAGES", payload: messages });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "채팅 히스토리 로드 실패",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // 메시지 읽음 처리
  const markMessageAsRead = async (messageId: string) => {
    if (!state.currentRoom) return;

    try {
      await chatAPI.markMessageAsRead(state.currentRoom.id, messageId);
      // 읽지 않은 메시지 수 업데이트
      const unreadCount = await chatAPI.getUnreadMessageCount(
        state.currentRoom.id
      );
      dispatch({
        type: "SET_UNREAD_COUNTS",
        payload: { ...state.unreadCounts, [state.currentRoom.id]: unreadCount },
      });
    } catch (error) {
      console.error("메시지 읽음 처리 실패:", error);
    }
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: ChatContextType = {
    ...state,
    connect,
    disconnect,
    loadRooms,
    selectRoom,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    loadChatHistory,
    markMessageAsRead,
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
