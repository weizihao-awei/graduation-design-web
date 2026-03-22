import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getUnreadCount } from "@/api/message";
import { ElMessage } from "element-plus";

export const useMessageStore = defineStore("message", () => {
  const unreadCount = ref(0);
  const currentChatId = ref(null);
  const chatList = ref([]);
  const messageList = ref([]);
  const currentChatInfo = ref({
    otherNickname: "",
    otherAvatar: "",
    otherUserId: null,
  });

  const hasUnread = computed(() => unreadCount.value > 0);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount({});
      unreadCount.value = res.data;
      return res.data;
    } catch (error) {
      console.error("获取未读消息数量失败:", error);
      throw error;
    }
  };

  const setUnreadCount = (count) => {
    unreadCount.value = count;
  };

  const incrementUnreadCount = () => {
    unreadCount.value++;
  };

  const decrementUnreadCount = (count = 1) => {
    unreadCount.value = Math.max(0, unreadCount.value - count);
  };

  const setCurrentChatId = (chatId) => {
    currentChatId.value = chatId;
  };

  const setChatList = (list) => {
    chatList.value = list;
  };

  const updateChatInList = (chat) => {
    const index = chatList.value.findIndex((c) => c.chatId === chat.chatId);
    if (index !== -1) {
      chatList.value[index] = chat;
    } else {
      chatList.value.unshift(chat);
    }
  };

  const setMessages = (messages) => {
    messageList.value = messages;
  };

  const addMessage = (message) => {
    messageList.value.push(message);
  };

  const clearMessages = () => {
    messageList.value = [];
  };

  const setCurrentChatInfo = (info) => {
    currentChatInfo.value = info;
  };

  return {
    unreadCount,
    currentChatId,
    chatList,
    messageList,
    currentChatInfo,
    hasUnread,
    fetchUnreadCount,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    setCurrentChatId,
    setChatList,
    updateChatInList,
    setMessages,
    addMessage,
    clearMessages,
    setCurrentChatInfo,
  };
});
