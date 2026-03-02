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
                <el-button type="primary" @click="handlePublish" :loading="publishing">发布</el-button>
              </div>
            </div>
          </template>
          
          <el-form
            ref="articleFormRef"
            :model="articleForm"
            :rules="articleRules"
            label-width="80px"
            class="article-form"
          >
            <el-form-item label="文章标题" prop="title">
              <el-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="文章摘要" prop="summary">
              <el-input
                v-model="articleForm.summary"
                type="textarea"
                placeholder="请输入文章摘要"
                maxlength="500"
                show-word-limit
                :rows="3"
              />
            </el-form-item>
            
            <el-form-item label="封面图片" prop="coverImage">
              <el-input
                v-model="articleForm.coverImage"
                placeholder="请输入封面图片URL"
              />
              <div v-if="articleForm.coverImage" class="cover-preview">
                <img :src="articleForm.coverImage" alt="封面预览" @error="handleImageError">
              </div>
            </el-form-item>
            
            <el-form-item label="文章分类" prop="categoryId">
              <el-select v-model="articleForm.categoryId" placeholder="请选择分类" clearable>
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="文章标签" prop="tagIds">
              <el-select
                v-model="articleForm.tagIds"
                multiple
                placeholder="请选择标签"
                style="width: 100%"
              >
                <el-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                >
                  <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="文章内容" prop="content">
              <div class="editor-container">
                <el-tabs v-model="activeTab" class="editor-tabs">
                  <el-tab-pane label="Markdown" name="markdown">
                    <el-input
                      v-model="articleForm.content"
                      type="textarea"
                      placeholder="请输入文章内容，支持Markdown格式"
                      :rows="15"
                      class="markdown-editor"
                    />
                  </el-tab-pane>
                  <el-tab-pane label="预览" name="preview">
                    <div class="preview-container" v-html="htmlContent"></div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-form-item>
            
            <el-form-item label="文章设置">
              <div class="settings-row">
                <el-checkbox v-model="articleForm.isTop">置顶文章</el-checkbox>
                <el-checkbox v-model="articleForm.isRecommend">推荐文章</el-checkbox>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
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

// 是否是编辑模式
const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => route.params.id)

// 表单引用
const articleFormRef = ref()

// 状态
const saving = ref(false)
const publishing = ref(false)
const activeTab = ref('markdown')

// 表单数据
const articleForm = reactive({
  title: '',
  summary: '',
  content: '',
  htmlContent: '',
  coverImage: '',
  categoryId: null,
  tagIds: [],
  status: 1, // 1-发布，0-草稿
  isTop: false,
  isRecommend: false
})

// 表单验证规则
const articleRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 分类和标签数据
const categories = ref([])
const tags = ref([])

// 计算HTML内容
const htmlContent = computed(() => {
  if (!articleForm.content) return ''
  try {
    return renderMarkdown(articleForm.content)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return articleForm.content
  }
})

// 监听内容变化，更新HTML内容
watch(() => articleForm.content, () => {
  articleForm.htmlContent = htmlContent.value
}, { immediate: true })

// 处理图片错误
const handleImageError = (e) => {
  e.target.src = '/default-cover.jpg'
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!articleFormRef.value) return
  
  try {
    await articleFormRef.value.validate()
    saving.value = true
    
    const data = { ...articleForm, status: 0 } // 0-草稿
    
    if (isEdit.value) {
      await updateArticle({ ...data, id: articleId.value })
      ElMessage.success('草稿保存成功')
    } else {
      const res = await createArticle(data)
      ElMessage.success('草稿保存成功')
      // 跳转到编辑页面
      router.replace(`/write/${res.data}`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  if (!articleFormRef.value) return
  
  try {
    await articleFormRef.value.validate()
    publishing.value = true
    
    const data = { 
      ...articleForm, 
      status: 1, // 1-发布
      isTop: articleForm.isTop ? 1 : 0,
      isRecommend: articleForm.isRecommend ? 1 : 0
    }
    
    if (isEdit.value) {
      await updateArticle({ ...data, id: articleId.value })
      ElMessage.success('文章发布成功')
    } else {
      await createArticle(data)
      ElMessage.success('文章发布成功')
    }
    
    // 跳转到文章列表
    router.push('/articles')
  } catch (error) {
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  } finally {
    publishing.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    const res = await getTagList()
    tags.value = res.data
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 获取文章详情（编辑模式）
const fetchArticleDetail = async () => {
  if (!isEdit.value) return
  
  try {
    const res = await getArticleDetail(articleId.value)
    const article = res.data
    
    // 填充表单
    Object.assign(articleForm, {
      title: article.title,
      summary: article.summary,
      content: article.content,
      htmlContent: article.htmlContent,
      coverImage: article.coverImage,
      categoryId: article.categoryId,
      tagIds: article.tags?.map(tag => tag.id) || [],
      status: article.status,
      isTop: !!article.isTop,
      isRecommend: !!article.isRecommend
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
    router.push('/write')
  }
}

// 初始化数据
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
  // 检查登录状态
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

.article-form {
  padding: 20px 0;
}

.cover-preview {
  margin-top: 10px;
  width: 200px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.editor-container {
  width: 100%;
}

.editor-tabs {
  width: 100%;
}

.markdown-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.preview-container {
  min-height: 300px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  line-height: 1.6;
}

.settings-row {
  display: flex;
  gap: 20px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .settings-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>