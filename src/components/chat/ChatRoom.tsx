"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const ChatRoom: React.FC = () => {
  const { currentRoom, messages, leaveRoom } = useChat();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentRoom) {
    return null;
  }

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(currentRoom.id);
      setShowLeaveConfirm(false);
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 채팅방 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {currentRoom.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentRoom.name}
            </h2>
            <p className="text-sm text-gray-500">
              {currentRoom.participants.length}명 참여
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="text-gray-500 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            나가기
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-500">아직 메시지가 없습니다</p>
              <p className="text-gray-400 text-sm">
                첫 번째 메시지를 보내보세요!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id || `${message.timestamp}-${message.senderId}`}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <ChatInput />
      </div>

      {/* 채팅방 나가기 확인 모달 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">채팅방 나가기</h3>
            <p className="text-gray-600 mb-6">
              정말로 "{currentRoom.name}" 채팅방을 나가시겠습니까?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleLeaveRoom}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
