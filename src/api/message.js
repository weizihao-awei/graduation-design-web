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
