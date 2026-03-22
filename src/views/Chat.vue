<template>
  <div class="chat-container">
    <div class="chat-header">
      <el-button v-if="isMobile" :icon="ArrowLeft" circle @click="handleBack" class="back-button" />
      <div class="chat-title">
        <el-avatar :size="40" :src="getAvatarUrl(chatInfo.otherAvatar)">
          {{ chatInfo.otherNickname?.charAt(0) }}
        </el-avatar>
        <div class="chat-user-info">
          <div class="chat-user-name">{{ chatInfo.otherNickname }}</div>

        </div>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer" v-loading="loading">
      <div v-for="message in messageList" :key="message.id" class="message-item" :class="{
        'message-sent': String(message.senderId) === currentUserId,
        'message-received': String(message.senderId) !== currentUserId,
      }">
        <el-avatar :size="36" :src="String(message.senderId) === currentUserId
          ? getAvatarUrl(message.senderAvatar)
          : getAvatarUrl(message.receiverAvatar)
          ">
          {{
            String(message.senderId) === currentUserId
              ? message.senderNickname?.charAt(0)
              : message.receiverNickname?.charAt(0)
          }}
        </el-avatar>
        <div class="message-content">
          <div class="message-info">
            <span class="message-sender">{{
              String(message.senderId) === currentUserId
                ? "我"
                : message.senderNickname
            }}</span>
            <span class="message-time">{{
              formatMessageTime(message.createTime)
            }}</span>
          </div>
          <div class="message-text">{{ message.content }}</div>
        </div>
      </div>

      <el-empty v-if="!loading && messageList.length === 0" description="暂无消息" />
    </div>

    <div class="chat-input-area">
      <el-input v-model="inputMessage" type="textarea" :rows="3" placeholder="输入消息..."
        @keydown.enter.prevent="handleSend" :disabled="sending" />
      <div class="input-actions">
        <span class="input-tip">按 Enter 发送</span>
        <el-button type="primary" :icon="Promotion" @click="handleSend" :loading="sending"
          :disabled="!inputMessage.trim()">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store";
import { useMessageStore } from "@/store/message";
import { getMessageList, sendMessage, getChatList } from "@/api/message";
import { ElMessage } from "element-plus";
import { ArrowLeft, Promotion } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const messageStore = useMessageStore();

const loading = ref(false);
const sending = ref(false);
const inputMessage = ref("");
const messageList = ref([]);
const messagesContainer = ref(null);
const chatInfo = computed(() => messageStore.currentChatInfo);

const currentUserId = computed(() => String(userStore.userInfo.id));
const isMobile = computed(() => window.innerWidth <= 768);

const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const cleanUri = avatar.startsWith("/api/") ? avatar.substring(4) : avatar;
  return baseUrl + cleanUri;
};

const formatMessageTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return "刚刚";
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop =
        messagesContainer.value.scrollHeight;
    }
  });
};

const fetchMessages = async () => {
  loading.value = true;
  try {
    const res = await getMessageList({
      chatId: route.query.chatId,
      pageNum: 1,
      pageSize: 100,
    });
    messageList.value = res.data.list.sort((a, b) => {
      return new Date(a.createTime) - new Date(b.createTime);
    });
    messageStore.setMessages(res.data.list);
    scrollToBottom();
  } catch (error) {
    ElMessage.error("获取消息列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchChatInfo = async () => {
  try {
    const res = await getChatList({
      pageNum: 1,
      pageSize: 50,
    });
    const chat = res.data.list.find((c) => c.chatId === route.query.chatId);
    if (chat) {
      messageStore.setCurrentChatInfo({
        otherNickname: chat.otherNickname,
        otherAvatar: chat.otherAvatar,
        otherUserId: chat.otherUserId,
      });
    }
  } catch (error) {
    console.error("获取会话信息失败:", error);
  }
};

const handleSend = async () => {
  if (!inputMessage.value.trim()) return;

  if (!chatInfo.value.otherUserId) {
    ElMessage.error("接收者信息不完整，请刷新页面重试");
    return;
  }

  sending.value = true;
  try {
    const res = await sendMessage({
      chatId: route.query.chatId,
      receiverId: chatInfo.value.otherUserId,
      content: inputMessage.value.trim(),
    });

    const newMessage = {
      id: res.data,
      chatId: route.query.chatId,
      senderId: currentUserId.value,
      senderNickname: userStore.userInfo.nickname,
      senderAvatar: userStore.userInfo.avatar,
      receiverId: chatInfo.value.otherUserId,
      receiverNickname: chatInfo.value.otherNickname,
      receiverAvatar: chatInfo.value.otherAvatar,
      content: inputMessage.value.trim(),
      isRead: 0,
      createTime: new Date().toISOString(),
    };

    messageList.value.push(newMessage);
    inputMessage.value = "";
    scrollToBottom();
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
  } finally {
    sending.value = false;
  }
};

const handleBack = () => {
  router.back();
};

onMounted(() => {
  fetchMessages();
  fetchChatInfo();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-page);
  padding: 20px 120px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.back-button {
  flex-shrink: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chat-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-user-status {
  font-size: 12px;
  color: var(--success-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  margin: 16px 0;
  box-shadow: var(--shadow-light);
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-item.message-sent {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.message-item.message-sent .message-info {
  flex-direction: row-reverse;
}

.message-sender {
  font-weight: 500;
}

.message-time {
  opacity: 0.7;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-white);
  color: var(--text-primary);
  word-wrap: break-word;
  line-height: 1.5;
  box-shadow: var(--shadow-light);
}

.message-item.message-sent .message-text {
  background: var(--primary-color);
  color: white;
}

.message-item.message-received .message-text {
  background: var(--bg-white);
  border: 1px solid var(--border-light);
}

.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.chat-input-area .el-textarea {
  margin-bottom: 12px;
}

.chat-input-area .el-textarea :deep(.el-textarea__inner) {
  border-radius: var(--border-radius-lg);
  resize: none;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tip {
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .chat-container {
    padding: 10px 20px;
  }

  .chat-header {
    padding: 12px;
    border-radius: var(--border-radius-base);
  }

  .chat-messages {
    padding: 12px;
    margin: 10px 0;
    border-radius: var(--border-radius-base);
  }

  .message-text {
    max-width: 80%;
  }

  .chat-input-area {
    padding: 12px;
    border-radius: var(--border-radius-base);
  }
}
</style>
