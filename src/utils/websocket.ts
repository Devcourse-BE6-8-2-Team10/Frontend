import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnected: boolean = false;

  // WebSocket 연결
  public connect(userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("WebSocket 연결 시도...");
        
        this.client = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/chat"),
          connectHeaders: {
            "user-email": userEmail
          },
          debug: process.env.NODE_ENV === "development" ? console.log : undefined,
          reconnectDelay: 0,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log("WebSocket 연결 성공");
          this.isConnected = true;
          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error("STOMP 에러:", frame);
          reject(new Error(frame.headers.message || "STOMP 연결 에러"));
        };

        this.client.onWebSocketError = (error) => {
          console.error("WebSocket 에러:", error);
          reject(error);
        };

        this.client.onWebSocketClose = () => {
          console.log("WebSocket 연결 종료");
          this.isConnected = false;
          this.subscriptions.clear();
        };

        this.client.activate();
      } catch (error) {
        console.error("WebSocket 연결 중 에러:", error);
        reject(error);
      }
    });
  }

  // 연결 해제
  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  // 채팅방 구독
  public subscribeToChatRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void
  ): void {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    // 기존 구독이 있으면 해제
    this.unsubscribeFromChatRoom(roomId);

    const subscription = this.client.subscribe(
      `/topic/chat/${roomId}`,
      (message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          onMessage(chatMessage);
        } catch (error) {
          console.error("메시지 파싱 에러:", error);
        }
      }
    );

    this.subscriptions.set(roomId, subscription);
    console.log(`채팅방 ${roomId} 구독 완료`);
  }

  // 채팅방 구독 해제
  public unsubscribeFromChatRoom(roomId: string): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      console.log(`채팅방 ${roomId} 구독 해제`);
    }
  }

  // 메시지 전송
  public sendMessage(
    roomId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ): void {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    this.client.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message),
    });
    
    console.log("메시지 전송:", message);
  }

  // 연결 상태 확인
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService();
export default webSocketService;
