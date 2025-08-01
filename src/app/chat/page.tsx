"use client";

import { ChatProvider } from "@/contexts/ChatContext";
import ChatRoom from "@/components/chat/ChatRoom";

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatRoom />
    </ChatProvider>
  );
}
