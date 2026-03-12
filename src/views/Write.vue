<template>
  <div class="write-page">
    <Header />

    <div class="container">
      <div class="write-container">
        <el-card class="write-card">
          <template #header>
            <div class="card-header">
              <span>{{ isEdit ? '编辑文章' : '写文章' }}</span>
              <div class="header-actions">
                <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
                <el-button type="primary" @click="handlePublishClick" :loading="publishing">发布</el-button>
              </div>
            </div>
          </template>

          <div class="editor-wrapper">
            <el-tabs v-model="activeTab" class="editor-tabs">
              <el-tab-pane label="Markdown" name="markdown">
                <el-input v-model="articleForm.content" type="textarea" placeholder="开始写作吧..." :rows="20"
                  class="markdown-editor" />
              </el-tab-pane>
              <el-tab-pane label="预览" name="preview">
                <div class="preview-container" v-html="htmlContent"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </div>
    </div>

    <ArticlePublishDialog v-model="publishDialogVisible" :article-data="articleMetadata" :categories="categories"
      :tags="tags" @confirm="handlePublishConfirm" />

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticlePublishDialog from '@/components/ArticlePublishDialog.vue'
import { useUserStore } from '@/store'
import {
  createArticle,
  updateArticle,
  getArticleDetail
} from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { ElMessage } from 'element-plus'
import { renderMarkdown } from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => route.params.id)

const saving = ref(false)
const publishing = ref(false)
const activeTab = ref('markdown')
const publishDialogVisible = ref(false)

const articleForm = reactive({
  content: '',
  htmlContent: ''
})

const articleMetadata = reactive({
  title: '',
  summary: '',
  coverImage: '',
  categoryId: null,
  tagIds: [],
  isTop: false,
  isRecommend: false
})

const categories = ref([])
const tags = ref([])

const htmlContent = computed(() => {
  if (!articleForm.content) return ''
  try {
    return renderMarkdown(articleForm.content)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return articleForm.content
  }
})

watch(() => articleForm.content, () => {
  articleForm.htmlContent = htmlContent.value
}, { immediate: true })

const handleSaveDraft = async () => {
  if (!articleForm.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  try {
    saving.value = true

    const data = {
      title: '未命名草稿',
      summary: articleForm.content.substring(0, 100) + '...',
      content: articleForm.content,
      htmlContent: articleForm.htmlContent,
      status: 0
    }

    if (isEdit.value) {
      await updateArticle({ ...data, id: articleId.value })
      ElMessage.success('草稿保存成功')
    } else {
      const res = await createArticle(data)
      ElMessage.success('草稿保存成功')
      router.replace(`/write/${res.data}`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

const handlePublishClick = async () => {
  if (!articleForm.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  publishDialogVisible.value = true
}

const handlePublishConfirm = async (publishData) => {
  try {
    publishing.value = true

    const data = {
      ...publishData,
      content: articleForm.content,
      htmlContent: articleForm.htmlContent,
      status: 1
    }

    if (isEdit.value) {
      await updateArticle({ ...data, id: articleId.value })
      ElMessage.success('文章发布成功')
    } else {
      await createArticle(data)
      ElMessage.success('文章发布成功')
    }

    router.push('/articles')
  } catch (error) {
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  } finally {
    publishing.value = false
    publishDialogVisible.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchTags = async () => {
  try {
    const res = await getTagList()
    tags.value = res.data
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

const fetchArticleDetail = async () => {
  if (!isEdit.value) return

  try {
    const res = await getArticleDetail(articleId.value)
    const article = res.data

    Object.assign(articleForm, {
      content: article.content,
      htmlContent: article.htmlContent
    })

    Object.assign(articleMetadata, {
      title: article.title,
      summary: article.summary,
      coverImage: article.coverImage,
      categoryId: article.categoryId,
      tagIds: article.tags?.map(tag => tag.id) || [],
      isTop: !!article.isTop,
      isRecommend: !!article.isRecommend
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
    router.push('/write')
  }
}

const initData = async () => {
  await Promise.all([
    fetchCategories(),
    fetchTags()
  ])

  if (isEdit.value) {
    await fetchArticleDetail()
  }
}

onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  initData()
})
</script>

<style scoped>
.write-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.write-container {
  margin-bottom: 40px;
}

.write-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-wrapper {
  padding: 20px 0;
}

.editor-tabs {
  width: 100%;
}

.markdown-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.preview-container {
  min-height: 400px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .markdown-editor {
    font-size: 13px;
  }
}
</style>
