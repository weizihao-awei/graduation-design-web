<template>
  <el-card>
    <template #header>
      <div class="section-header">
        <span>{{ title }}</span>
        <el-button v-if="showWriteButton" type="primary" @click="$router.push('/write')">
          写文章
        </el-button>
      </div>
    </template>

    <div class="article-list" v-infinite-scroll="loadMore" :infinite-scroll-disabled="!hasMore || loading">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <div class="loading-more" v-if="loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <el-empty v-if="!loading && articles.length === 0" :description="emptyText" />
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import ArticleCard from '@/components/ArticleCard.vue'
import {
  getUserCollections,
  getUserPraises,
  getUserReads,
  getUserPublished
} from '@/api/user'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['published', 'collection', 'praise', 'read'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  showWriteButton: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Number,
    required: true
  }
})

const articles = ref([])
const loading = ref(false)
const hasMore = ref(true)
const pageNum = ref(1)

const fetchArticles = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true

    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    let res
    const params = {
      pageNum: pageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    }

    switch (props.type) {
      case 'published':
        res = await getUserPublished({
          userId: props.userId,
          ...params
        })
        break
      case 'collection':
        res = await getUserCollections(params)
        break
      case 'praise':
        res = await getUserPraises(params)
        break
      case 'read':
        res = await getUserReads(params)
        break
    }

    if (reset) {
      articles.value = res.data.list || []
    } else {
      articles.value = [...articles.value, ...(res.data.list || [])]
    }

    hasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error(`获取${props.title}失败:`, error)
    ElMessage.error(`获取${props.title}失败`)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  fetchArticles()
}

const refresh = () => {
  fetchArticles(true)
}

defineExpose({
  refresh,
  fetchArticles
})

watch(() => props.type, () => {
  refresh()
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-list {
  min-height: 200px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.loading-more .el-icon {
  margin-right: 8px;
}
</style>
