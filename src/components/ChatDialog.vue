<template>
  <el-dialog v-model="visible" :title="`${chatInfo.otherNickname}的私信`" width="700px" :close-on-click-modal="false"
    @close="handleClose" class="chat-dialog" :modal="true" :append-to-body="true" :lock-scroll="true">
    <div class="chat-dialog-content">
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
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { useUserStore } from "@/store";
import { getMessageList, sendMessage } from "@/api/message";
import { ElMessage } from "element-plus";
import { Promotion } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  otherNickname: {
    type: String,
    default: ""
  },
  otherAvatar: {
    type: String,
    default: ""
  },
  otherUserId: {
    type: Number,
    default: null
  },
  chatId: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(['update:modelValue']);

const userStore = useUserStore();

const loading = ref(false);
const sending = ref(false);
const inputMessage = ref("");
const messageList = ref([]);
const messagesContainer = ref(null);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const chatInfo = computed(() => ({
  otherNickname: props.otherNickname,
  otherAvatar: props.otherAvatar,
  otherUserId: props.otherUserId
}));

const currentUserId = computed(() => String(userStore.userInfo.id));

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
  if (!props.chatId) return;

  loading.value = true;
  try {
    const res = await getMessageList({
      chatId: props.chatId,
      pageNum: 1,
      pageSize: 100,
    });
    messageList.value = res.data.list.sort((a, b) => {
      return new Date(a.createTime) - new Date(b.createTime);
    });
    scrollToBottom();
  } catch (error) {
    ElMessage.error("获取消息列表失败");
  } finally {
    loading.value = false;
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
      chatId: props.chatId,
      receiverId: chatInfo.value.otherUserId,
      content: inputMessage.value.trim(),
    });

    const newMessage = {
      id: res.data,
      chatId: props.chatId,
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

const handleClose = () => {
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchMessages();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.chat-dialog :deep(.el-dialog) {
  margin-top: 2vh !important;
}

.chat-dialog :deep(.el-overlay) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

.chat-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}

.chat-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.chat-dialog-content {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
  margin-bottom: 16px;
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
</style>
