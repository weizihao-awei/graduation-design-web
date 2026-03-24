import { useUserStore } from "@/store";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  /**
   * 获取 WebSocket 连接地址
   */
  getWebSocketUrl() {
    const userStore = useUserStore();
    const token = userStore.token;
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;

    return `/ws/message?token=${token}`;
  }

  /**
   * 建立 WebSocket 连接
   */
  connect() {
    console.log("[WebSocket] connect() 被调用");
    console.log("[WebSocket] 当前状态:", {
      socket: this.socket,
      readyState: this.socket?.readyState,
      isConnecting: this.isConnecting,
      OPEN: WebSocket.OPEN,
    });

    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log("[WebSocket] 已连接或正在连接中，跳过");
      return;
    }

    this.isConnecting = true;
    const url = this.getWebSocketUrl();
    const userStore = useUserStore();
    const token = userStore.token;

    console.log("[WebSocket] 正在连接:", url);
    console.log("[WebSocket] Token 存在:", !!token);
    console.log("[WebSocket] Token 长度:", token?.length);

    if (!token) {
      console.error("[WebSocket] Token 为空，无法建立连接");
      this.isConnecting = false;
      return;
    }

    try {
      console.log("[WebSocket] 创建 WebSocket 实例...");
      console.log("[WebSocket] Token 存在:", !!token);

      // 检查 token 是否有效
      if (!token || typeof token !== "string") {
        throw new Error(`Token 无效: ${typeof token}`);
      }

      // 直接使用 URL 参数传递 token，后端从 URL 参数读取
      this.socket = new WebSocket(url);
      console.log("[WebSocket] WebSocket 实例已创建:", this.socket);
      console.log(
        "[WebSocket] readyState:",
        this.socket.readyState,
        "(0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)",
      );

      this.socket.onopen = (event) => {
        console.log("[WebSocket] 连接已建立", event);
        this.isConnecting = false;
        this.emit("open", null);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[WebSocket] 收到消息:", message);
          this.emit("message", message);
        } catch (error) {
          console.error(
            "[WebSocket] 解析消息失败:",
            error,
            "原始数据:",
            event.data,
          );
        }
      };

      this.socket.onclose = (event) => {
        console.log("[WebSocket] 连接关闭", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        this.isConnecting = false;
        this.emit("close", event);
        // 不自动重连，由调用方决定
      };

      this.socket.onerror = (error) => {
        console.error("[WebSocket] 连接错误:", error);
        this.isConnecting = false;
        this.emit("error", error);
      };
    } catch (error) {
      console.error("[WebSocket] 创建连接失败:", error);
      this.isConnecting = false;
      // 不自动重连，由调用方决定
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件类型: 'open' | 'message' | 'close' | 'error'
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听的函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] ${event} 事件处理错误:`, error);
      }
    });
  }

  /**
   * 检查连接状态
   */
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// 创建单例实例
const wsService = new WebSocketService();

export default wsService;
