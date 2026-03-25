<template>
  <div class="chat-page">
    <!-- 页面头部组件 -->
    <Header />

    <div class="container">
      <div v-loading="loading" class="chat-container">
        <!-- 聊天内容区域：当获取到对方用户信息时显示 -->
        <div v-if="otherUserInfo.id" class="chat-content">
          <!-- 聊天头部：返回按钮和对方用户信息 -->
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

          <!-- 消息列表区域 -->
          <div class="chat-messages" ref="messagesContainer" v-loading="loadingMessages">
            <!-- 遍历显示消息列表，根据发送者判断消息样式 -->
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

            <!-- 无消息时的空状态提示 -->
            <el-empty v-if="!loadingMessages && !messageList.length" description="暂无消息" />
          </div>

          <!-- 消息输入区域 -->
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

        <!-- 用户不存在时的空状态提示 -->
        <el-empty v-else-if="!loading" description="用户不存在" />
      </div>
    </div>

    <!-- 页面底部组件 -->
    <Footer />
  </div>
</template>

<script setup>
/**
 * Chat.vue - 私聊页面组件
 *
 * 功能说明：
 * - 实现用户之间的实时私聊功能
 * - 支持消息的发送和接收
 * - 使用 WebSocket 实现消息实时推送
 * - 支持消息历史记录加载
 */

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

// ==================== 路由和状态管理 ====================
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// ==================== 响应式数据 ====================
const loading = ref(false);              // 页面初始化加载状态
const loadingMessages = ref(false);      // 消息列表加载状态
const sending = ref(false);              // 消息发送状态
const inputMessage = ref("");            // 输入框内容
const messageList = ref([]);             // 消息列表
const messagesContainer = ref(null);     // 消息容器 DOM 引用
const otherUserInfo = ref({});           // 对方用户信息
const chatId = ref("");                  // 聊天会话 ID
const unsubscribeMessage = ref(null);    // WebSocket 消息订阅取消函数

// ==================== 计算属性 ====================

/**
 * 当前用户 ID（转为字符串类型便于比较）
 */
const currentUserId = computed(() => String(userStore.userInfo.id));

/**
 * 判断消息是否由当前用户发送
 * @param {string|number} senderId - 发送者 ID
 * @returns {boolean} 是否为当前用户发送
 */
const isMe = (senderId) => String(senderId) === currentUserId.value;

// ==================== 工具函数 ====================

/**
 * 获取头像完整 URL
 * @param {string} avatar - 头像路径或 URL
 * @returns {string} 完整的头像 URL
 */
const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const cleanUri = avatar.startsWith("/api/") ? avatar.substring(4) : avatar;
  return baseUrl + cleanUri;
};

/**
 * 格式化消息时间
 * @param {string} time - 消息创建时间
 * @returns {string} 格式化后的时间字符串
 */
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

/**
 * 滚动消息列表到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// ==================== 消息相关操作 ====================

/**
 * 获取消息列表
 * 从服务器获取当前聊天的历史消息，并过滤掉已存在的消息
 */
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

/**
 * 发送消息
 * 将输入框中的消息发送给服务器，并刷新消息列表
 */
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

/**
 * 返回上一页
 */
const handleBack = () => router.back();

// ==================== WebSocket 相关 ====================

/**
 * 处理 WebSocket 收到的消息
 * @param {Object} message - 收到的消息对象
 */
const handleWebSocketMessage = (message) => {
  console.log("[WebSocket] 收到消息:", message);

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
 * 订阅消息、连接成功和连接失败事件
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
 * 取消消息订阅
 */
const stopWebSocket = () => {
  // 取消消息订阅
  if (unsubscribeMessage.value) {
    unsubscribeMessage.value();
    unsubscribeMessage.value = null;
  }
};

// ==================== 初始化 ====================

/**
 * 初始化聊天页面
 * - 获取或创建聊天会话
 * - 获取对方用户信息
 * - 加载历史消息
 * - 启动 WebSocket 连接
 */
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

// ==================== 生命周期钩子 ====================

// 组件挂载时初始化聊天
onMounted(initChat);

// 组件卸载时停止 WebSocket 连接
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
