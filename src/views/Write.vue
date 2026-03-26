<template>
  <div class="write-page">
    <!-- 页面头部导航 -->
    <Header />

    <div class="container">
      <div class="write-container">
        <!-- 文章编辑卡片 -->
        <el-card class="write-card">
          <!-- 卡片头部：显示标题和操作按钮 -->
          <template #header>
            <div class="card-header">
              <!-- 根据是否编辑模式显示不同标题 -->
              <span>{{ isEdit ? '编辑文章' : '写文章' }}</span>
              <div class="header-actions">
                <!-- 发布文章按钮 -->
                <el-button type="primary" @click="handlePublishClick" :loading="publishing">发布</el-button>
              </div>
            </div>
          </template>

          <!-- 编辑器区域 -->
          <div class="editor-wrapper">
            <!-- 标签页：Markdown编辑和预览 -->
            <el-tabs v-model="activeTab" class="editor-tabs">
              <!-- Markdown编辑标签页 -->
              <el-tab-pane label="Markdown" name="markdown">
                <!-- 文本域：用于输入Markdown格式的内容 -->
                <el-input v-model="articleForm.content" type="textarea" placeholder="开始写作吧..." :rows="20"
                  class="markdown-editor" />
              </el-tab-pane>
              <!-- 预览标签页：显示渲染后的HTML内容 -->
              <el-tab-pane label="预览" name="preview">
                <!-- 使用v-html渲染Markdown转换后的HTML -->
                <div class="preview-container" v-html="htmlContent"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 文章发布对话框：用于设置文章的元数据（标题、摘要、封面等） -->
    <ArticlePublishDialog v-model="publishDialogVisible" :article-data="articleMetadata" :categories="categories"
      :tags="tags" @confirm="handlePublishConfirm" />

    <!-- 页面底部 -->
    <Footer />
  </div>
</template>

<script setup>
// 导入Vue组合式API
import { ref, reactive, computed, onMounted, watch } from 'vue'
// 导入Vue Router用于路由跳转和获取路由参数
import { useRoute, useRouter } from 'vue-router'
// 导入页面组件
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticlePublishDialog from '@/components/ArticlePublishDialog.vue'
// 导入用户状态管理
import { useUserStore } from '@/store'
// 导入文章相关API
import {
  createArticle,
  updateArticle,
  getArticleDetail
} from '@/api/article'
// 导入分类和标签API
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
// 导入Element Plus消息提示组件
import { ElMessage } from 'element-plus'
// 导入工具函数：Markdown渲染
import { renderMarkdown } from '@/utils'

// 初始化路由
const route = useRoute()
const router = useRouter()
// 获取用户状态管理实例
const userStore = useUserStore()

// 计算属性：判断当前是否为编辑模式（根据路由参数中是否有文章ID）
const isEdit = computed(() => !!route.params.id)
// 计算属性：获取当前编辑的文章ID
const articleId = computed(() => route.params.id)

// 状态变量：发布文章时的加载状态
const publishing = ref(false)
// 状态变量：当前激活的标签页（markdown或preview）
const activeTab = ref('markdown')
// 状态变量：控制发布对话框的显示/隐藏
const publishDialogVisible = ref(false)

// 响应式数据：文章内容表单
const articleForm = reactive({
  content: '',        // Markdown格式的文章内容
  htmlContent: ''     // 渲染后的HTML内容
})

// 响应式数据：文章元数据（标题、摘要、封面、分类、标签等）
const articleMetadata = reactive({
  title: '',         // 文章标题
  summary: '',       // 文章摘要
  coverImage: '',    // 封面图片URL
  categoryId: null,   // 分类ID
  tagIds: [],        // 标签ID数组
  isTop: false,      // 是否置顶
  isRecommend: false  // 是否推荐
})

// 响应式数据：分类列表
const categories = ref([])
// 响应式数据：标签列表
const tags = ref([])

// 计算属性：将Markdown内容渲染为HTML
const htmlContent = computed(() => {
  // 如果内容为空，返回空字符串
  if (!articleForm.content) return ''
  try {
    // 调用renderMarkdown函数将Markdown转换为HTML
    return renderMarkdown(articleForm.content)
  } catch (error) {
    // 如果渲染失败，输出错误并返回原始内容
    console.error('Markdown解析错误:', error)
    return articleForm.content
  }
})

// 监听器：监听文章内容变化，实时更新HTML内容
watch(() => articleForm.content, () => {
  articleForm.htmlContent = htmlContent.value
}, { immediate: true })

// 处理点击发布按钮
const handlePublishClick = async () => {
  // 检查内容是否为空
  if (!articleForm.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  // 显示发布对话框，让用户设置文章元数据
  publishDialogVisible.value = true
}

// 处理确认发布（在对话框中点击确认按钮后触发）
const handlePublishConfirm = async (publishData) => {
  try {
    // 设置发布状态为加载中
    publishing.value = true

    // 构造发布文章的数据对象
    const data = {
      ...publishData,  // 包含用户在对话框中设置的元数据
      content: articleForm.content,      // Markdown内容
      htmlContent: articleForm.htmlContent,  // HTML内容
      status: 1  // 1表示已发布状态
    }

    // 判断是编辑还是新建
    if (isEdit.value) {
      // 编辑模式：调用更新文章API
      await updateArticle({ ...data, id: articleId.value })
      ElMessage.success('文章发布成功')
    } else {
      // 新建模式：调用创建文章API
      await createArticle(data)
      ElMessage.success('文章发布成功')
    }

    // 发布成功后跳转到文章列表页
    router.push('/articles')
  } catch (error) {
    // 发布失败，输出错误并提示用户
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  } finally {
    // 无论成功失败，都关闭加载状态和对话框
    publishing.value = false
    publishDialogVisible.value = false
  }
}

// 获取分类列表数据
const fetchCategories = async () => {
  try {
    // 调用获取分类列表API
    const res = await getCategoryList()
    // 保存分类数据
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取标签列表数据
const fetchTags = async () => {
  try {
    // 调用获取标签列表API
    const res = await getTagList()
    // 保存标签数据
    tags.value = res.data
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 获取文章详情（编辑模式下使用）
const fetchArticleDetail = async () => {
  // 如果不是编辑模式，直接返回
  if (!isEdit.value) return

  try {
    // 调用获取文章详情API
    const res = await getArticleDetail(articleId.value)
    const article = res.data

    // 填充文章内容表单
    Object.assign(articleForm, {
      content: article.content,
      htmlContent: article.htmlContent
    })

    // 填充文章元数据
    Object.assign(articleMetadata, {
      title: article.title,
      summary: article.summary,
      coverImage: article.coverImage,
      categoryId: article.categoryId,
      tagIds: article.tags?.map(tag => tag.id) || [],  // 提取标签ID数组
      isTop: !!article.isTop,      // 转换为布尔值
      isRecommend: !!article.isRecommend  // 转换为布尔值
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
    // 获取失败，跳转到写文章页面
    router.push('/write')
  }
}

// 初始化页面数据
const initData = async () => {
  // 并发请求分类和标签数据（提高性能）
  await Promise.all([
    fetchCategories(),
    fetchTags()
  ])

  // 如果是编辑模式，获取文章详情
  if (isEdit.value) {
    await fetchArticleDetail()
  }
}

// 组件挂载时执行
onMounted(() => {
  // 检查用户是否登录
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    // 未登录，跳转到登录页面
    router.push('/login')
    return
  }

  // 初始化数据
  initData()
})
</script>

<style scoped>
/* 页面整体样式 */
.write-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 容器样式 */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 写作容器样式 */
.write-container {
  margin-bottom: 40px;
}

/* 写作卡片样式 */
.write-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 头部操作按钮区域样式 */
.header-actions {
  display: flex;
  gap: 10px;
}

/* 编辑器包装器样式 */
.editor-wrapper {
  padding: 20px 0;
}

/* 编辑器标签页样式 */
.editor-tabs {
  width: 100%;
}

/* Markdown编辑器样式 */
.markdown-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 预览容器样式 */
.preview-container {
  min-height: 400px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  line-height: 1.8;
}

/* 响应式设计：小屏幕适配 */
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
