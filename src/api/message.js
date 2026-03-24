import request from "@/utils/request";

export function getOrCreateChat(data) {
  return request({
    url: "/message/chat/get-or-create",
    method: "post",
    data,
  });
}

export function sendMessage(data) {
  return request({
    url: "/message/send",
    method: "post",
    data,
  });
}

export function getChatList(data) {
  return request({
    url: "/message/chat/list",
    method: "post",
    data,
  });
}

export function getMessageList(data) {
  return request({
    url: "/message/list",
    method: "post",
    data,
  });
}

export function getUnreadCount(data) {
  return request({
    url: "/message/unread/count",
    method: "post",
    data,
  });
}

/**
 * 获取 WebSocket 连接用的临时 Token
 * 用于安全地建立 WebSocket 连接，避免在 URL 或子协议中暴露 JWT
 */
export function getWebSocketToken() {
  return request({
    url: "/message/ws/token",
    method: "get",
  });
}
