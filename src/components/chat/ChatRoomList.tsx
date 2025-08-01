"use client";

import React from "react";
import { useChat } from "@/contexts/ChatContext";
import { ChatRoom } from "@/utils/websocket";

interface ChatRoomItemProps {
  room: ChatRoom;
  isSelected: boolean;
  unreadCount: number;
  onSelect: (room: ChatRoom) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  unreadCount,
  onSelect,
}) => {
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

  return (
    <div
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
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
            {room.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatTime(room.lastMessage.timestamp)}
              </span>
            )}
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
  );
};

const ChatRoomList: React.FC = () => {
  const { rooms, currentRoom, unreadCounts, selectRoom } = useChat();

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
        />
      ))}
    </div>
  );
};

export default ChatRoomList;
