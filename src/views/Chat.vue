<template>
  <div class="chat-page">
    <Header />

    <div class="container">
      <div v-loading="loading" class="chat-container">
        <div v-if="otherUserInfo.id" class="chat-content">
          <div class="chat-header">
            <el-button :icon="ArrowLeft" @click="handleBack" circle />
            <div class="chat-title">
              <el-avatar :size="40" :src="getAvatarUrl(otherUserInfo.avatar)">
                {{ otherUserInfo.nickname?.charAt(0) }}
              </el-avatar>
              <div class="chat-user-info">
                <h2 class="chat-user-name">{{ otherUserInfo.nickname }}</h2>
              </div>
            </div>
          </div>

          <div class="chat-messages" ref="messagesContainer" v-loading="loadingMessages">
            <div v-for="message in messageList" :key="message.id" class="message-item"
              :class="isMe(message.senderId) ? 'message-sent' : 'message-received'">
              <!-- 修复：统一使用 sender 的信息显示头像，因为消息气泡旁边显示的是发送这条消息的人 -->
              <el-avatar :size="36" :src="getAvatarUrl(message.senderAvatar)">
                {{ message.senderNickname?.charAt(0) }}
              </el-avatar>

              <div class="message-content">
                <div class="message-info">
                  <span class="message-sender">
                    {{ isMe(message.senderId) ? '我' : message.senderNickname }}
                  </span>
                  <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>

            <el-empty v-if="!loadingMessages && !messageList.length" description="暂无消息" />
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

        <el-empty v-else-if="!loading" description="用户不存在" />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store";
import { getMessageList, sendMessage, getOrCreateChat } from "@/api/message";
import { getUserInfo } from "@/api/user";
import { ElMessage } from "element-plus";
import { Promotion, ArrowLeft } from "@element-plus/icons-vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import wsService from "@/utils/websocket";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const loadingMessages = ref(false);
const sending = ref(false);
const inputMessage = ref("");
const messageList = ref([]);
const messagesContainer = ref(null);
const otherUserInfo = ref({});
const chatId = ref("");
const unsubscribeMessage = ref(null);

const currentUserId = computed(() => String(userStore.userInfo.id));
const isMe = (senderId) => String(senderId) === currentUserId.value;

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

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const fetchMessages = async () => {
  if (!chatId.value) return;

  loadingMessages.value = true;
  try {
    const res = await getMessageList({
      chatId: chatId.value,
      pageNum: 1,
      pageSize: 100,
    });
    const newMessages = res.data.list.sort((a, b) =>
      new Date(a.createTime) - new Date(b.createTime)
    );

    const existingIds = new Set(messageList.value.map(m => m.id));
    const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));

    if (uniqueNewMessages.length > 0) {
      messageList.value = [...messageList.value, ...uniqueNewMessages];
      scrollToBottom();
    }
  } catch {
    ElMessage.error("获取消息列表失败");
  } finally {
    loadingMessages.value = false;
  }
};

const handleSend = async () => {
  const content = inputMessage.value.trim();
  if (!content) return;
  if (!otherUserInfo.value.id) {
    ElMessage.error("接收者信息不完整，请刷新页面重试");
    return;
  }

  sending.value = true;
  try {
    await sendMessage({
      chatId: chatId.value,
      receiverId: otherUserInfo.value.id,
      content,
    });

    inputMessage.value = "";
    await fetchMessages();
  } catch {
    ElMessage.error("发送消息失败");
  } finally {
    sending.value = false;
  }
};

const handleBack = () => router.back();

/**
 * 处理 WebSocket 收到的消息
 */
const handleWebSocketMessage = (message) => {
  console.log("[WebSocket] 收到消息:", message);
  //弹框提示新消息
  ElMessage.success(`收到新消息: ${message.content}`);
  // 只处理与当前聊天相关的消息
  if (message.chatId === chatId.value) {
    const existingIds = new Set(messageList.value.map(m => m.id));
    if (!existingIds.has(message.id)) {
      messageList.value.push(message);
      scrollToBottom();
    }
  }
};

/**
 * 启动 WebSocket 连接
 */
const startWebSocket = () => {
  // 订阅消息事件
  unsubscribeMessage.value = wsService.on("message", handleWebSocketMessage);
  // 订阅连接成功事件
  wsService.on("open", () => {
    ElMessage.success("WebSocket 连接成功");
  });
  // 订阅连接失败事件
  wsService.on("error", (error) => {
    ElMessage.error("WebSocket 连接失败");
  });
  // 建立连接
  wsService.connect();
};

/**
 * 停止 WebSocket 连接
 */
const stopWebSocket = () => {
  // 取消消息订阅
  if (unsubscribeMessage.value) {
    unsubscribeMessage.value();
    unsubscribeMessage.value = null;
  }
};

const initChat = async () => {
  const userId = route.params.userId;
  if (!userId) return;

  loading.value = true;
  try {
    const [chatRes, authorRes] = await Promise.all([
      getOrCreateChat({ otherUserId: userId }),
      getUserInfo(userId)
    ]);

    chatId.value = chatRes.data;
    otherUserInfo.value = authorRes.data;
    await fetchMessages();
    startWebSocket();
  } catch {
    ElMessage.error("初始化聊天失败");
  } finally {
    loading.value = false;
  }
};

onMounted(initChat);
onUnmounted(stopWebSocket);
</script>

<style scoped>
/* 样式保持不变 */
.chat-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.chat-container {
  animation: fadeIn 0.5s ease-in-out;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-white);
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
  gap: 4px;
}

.chat-user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-page);
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-white);
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .chat-content {
    height: calc(100vh - 140px);
  }

  .chat-header {
    padding: 16px;
  }

  .chat-user-name {
    font-size: 1rem;
  }

  .chat-messages {
    padding: 16px;
  }

  .chat-input-area {
    padding: 16px;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
