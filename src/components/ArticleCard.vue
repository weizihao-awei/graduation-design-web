<template>
  <div class="article-card">
    <div class="card-content">
      <!-- 封面图片 -->
      <div v-if="article.coverImage" class="cover-image">
        <img :src="article.coverImage" :alt="article.title" @error="handleImageError">
      </div>
      
      <div class="article-info">
        <!-- 标题 -->
        <h3 class="article-title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
        </h3>
        
        <!-- 摘要 -->
        <p class="article-summary">{{ article.summary }}</p>
        
        <!-- 标签 -->
        <div v-if="article.tags && article.tags.length" class="article-tags">
          <el-tag
            v-for="tag in article.tags"
            :key="tag.id"
            :color="tag.color"
            size="small"
            @click="handleTagClick(tag)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        
        <!-- 底部信息 -->
        <div class="article-meta">
          <div class="author-info">
            <el-avatar :size="24" :src="article.authorAvatar">
              {{ article.authorName?.charAt(0) }}
            </el-avatar>
            <span class="author-name">{{ article.authorName }}</span>
          </div>
          
          <div class="meta-info">
            <span class="category" v-if="article.categoryName">
              <el-icon><Folder /></el-icon>
              {{ article.categoryName }}
            </span>
            <span class="publish-time">
              <el-icon><Clock /></el-icon>
              {{ formatRelativeTime(article.publishTime) }}
            </span>
            <span class="view-count">
              <el-icon><View /></el-icon>
              {{ article.viewCount }}
            </span>
            <span class="like-count">
              <el-icon><Star /></el-icon>
              {{ article.likeCount }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮（管理员或作者可见） -->
    <div v-if="showActions" class="card-actions">
      <el-button 
        v-if="canEdit" 
        type="primary" 
        size="small" 
        @click="handleEdit"
      >
        编辑
      </el-button>
      <el-button 
        v-if="canDelete" 
        type="danger" 
        size="small" 
        @click="handleDelete"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Folder, Clock, View, Star } from '@element-plus/icons-vue'
import { formatRelativeTime } from '@/utils'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

const router = useRouter()
const userStore = useUserStore()

// 计算属性
const canEdit = computed(() => {
  return userStore.isLogin && 
         (userStore.isAdmin || userStore.userInfo.id === props.article.authorId)
})

const canDelete = computed(() => {
  return userStore.isLogin && 
         (userStore.isAdmin || userStore.userInfo.id === props.article.authorId)
})

// 方法
const handleImageError = (e) => {
  e.target.src = '/default-cover.jpg'
}

const handleTagClick = (tag) => {
  router.push(`/tag/${tag.id}`)
}

const handleEdit = () => {
  router.push(`/edit/${props.article.id}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('delete', props.article.id)
  } catch {
    // 取消删除
  }
}
</script>

<style scoped>
.article-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.article-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  padding: 20px;
  gap: 20px;
}

.cover-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.article-title a {
  color: #303133;
  text-decoration: none;
  transition: color 0.3s;
}

.article-title a:hover {
  color: #409EFF;
}

.article-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-tags .el-tag {
  cursor: pointer;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  color: #606266;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
  }
  
  .cover-image {
    width: 100%;
    height: 200px;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>