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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  // WebSocket 서버 URL 설정 (환경변수에서 가져오거나 기본값 사용)
  private getWebSocketUrl(): string {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8080/ws";
  }

  // 연결 초기화
  public connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(this.getWebSocketUrl()),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          debug:
            process.env.NODE_ENV === "development" ? console.log : undefined,
          reconnectDelay: 0, // 재연결 비활성화
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log("WebSocket 연결 성공");
          this.isConnected = true;
          this.reconnectAttempts = 0;
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
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }

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
  }

  // 채팅방 구독 해제
  public unsubscribeFromChatRoom(roomId: string): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  // 메시지 전송
  public sendMessage(
    roomId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ): void {
    if (!this.client || !this.isConnected) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }

    this.client.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message),
    });
  }

  // 연결 상태 확인
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // 개인 메시지 구독 (1:1 채팅용)
  public subscribeToPrivateMessages(
    userId: string,
    onMessage: (message: ChatMessage) => void
  ): void {
    if (!this.client || !this.isConnected) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }

    const subscription = this.client.subscribe(
      `/user/${userId}/queue/messages`,
      (message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          onMessage(chatMessage);
        } catch (error) {
          console.error("개인 메시지 파싱 에러:", error);
        }
      }
    );

    this.subscriptions.set(`private-${userId}`, subscription);
  }

  // 채팅방 참여 알림 구독
  public subscribeToRoomNotifications(
    roomId: string,
    onNotification: (notification: unknown) => void
  ): void {
    if (!this.client || !this.isConnected) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }

    const subscription = this.client.subscribe(
      `/topic/room/${roomId}/notifications`,
      (message) => {
        try {
          const notification = JSON.parse(message.body);
          onNotification(notification);
        } catch (error) {
          console.error("알림 파싱 에러:", error);
        }
      }
    );

    this.subscriptions.set(`notification-${roomId}`, subscription);
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService();
export default webSocketService;
