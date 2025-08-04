"use client";

import React, { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ChatRoom } from "@/utils/websocket";

interface ChatRoomItemProps {
  room: ChatRoom;
  isSelected: boolean;
  unreadCount: number;
  onSelect: (room: ChatRoom) => void;
  onDelete: (roomId: number) => Promise<void>;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  unreadCount,
  onSelect,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatLastMessage = (message?: ChatRoom["lastMessage"]) => {
    if (!message) return "새로운 채팅방입니다";
    return message.content.length > 30
      ? `${message.content.substring(0, 30)}...`
      : message.content;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "어제";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 채팅방 선택 이벤트 방지
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(room.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      alert('채팅방 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors relative ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-500"
            : "hover:bg-gray-50"
        }`}
        onClick={() => onSelect(room)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {room.name}
              </h3>
              <div className="flex items-center space-x-2">
                {room.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(room.lastMessage.timestamp)}
                  </span>
                )}
                {/* 삭제 버튼 - 인라인 스타일로 확실히 보이게 */}
                <button
                  onClick={handleDeleteClick}
                  style={{
                    padding: '4px',
                    color: '#666',
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="채팅방 나가기"
                  disabled={isDeleting}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {formatLastMessage(room.lastMessage)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {room.participants.length}명 참여
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              채팅방 나가기
            </h3>
            <p className="text-gray-600 mb-4">
              "{room.name}" 채팅방에서 나가시겠습니까?
              <br />
              <span className="text-sm text-red-500">
                나가면 채팅 기록이 모두 사라집니다.
              </span>
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "나가는 중..." : "나가기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ChatRoomList: React.FC = () => {
  const { rooms, currentRoom, unreadCounts, selectRoom, deleteChatRoom } = useChat();

  const handleDeleteRoom = async (roomId: number) => {
    await deleteChatRoom(roomId);
  };

  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-500 text-sm">채팅방이 없습니다</p>
          <p className="text-gray-400 text-xs">새 채팅방을 만들어보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          room={room}
          isSelected={currentRoom?.id === room.id}
          unreadCount={unreadCounts[room.id] || 0}
          onSelect={selectRoom}
          onDelete={handleDeleteRoom}
        />
      ))}
    </div>
  );
};

export default ChatRoomList;
