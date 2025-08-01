"use client";

import React, { useEffect, useState, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatRoom from "@/components/chat/ChatRoom";
import CreateRoomModal from "@/components/chat/CreateRoomModal";

export default function ChatPage() {
  const { isConnected, isLoading, error, connect, currentRoom } = useChat();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasConnected = useRef(false);

  useEffect(() => {
    // 페이지 로드 시 한 번만 WebSocket 연결 시도
    if (!hasConnected.current) {
      hasConnected.current = true;
      connect();
    }
  }, [connect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">연결 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={connect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            다시 연결
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 채팅방 목록 사이드바 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">채팅</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            새 채팅방 만들기
          </button>
        </div>
        <ChatRoomList />
      </div>

      {/* 채팅 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <ChatRoom />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">
                채팅방을 선택하세요
              </h2>
              <p className="text-gray-500">
                왼쪽에서 채팅방을 선택하거나 새 채팅방을 만들어보세요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 채팅방 생성 모달 */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
