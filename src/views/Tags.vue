<template>
  <div class="tags-page">
    <Header />
    
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">标签云</h1>
        <p class="page-subtitle">浏览所有标签，发现感兴趣的内容</p>
      </div>
      
      <div class="tags-content">
        <!-- 标签云 -->
        <div class="tags-cloud-section">
          <el-card class="cloud-card">
            <div class="tags-cloud">
              <el-tag
                v-for="tag in tags"
                :key="tag.id"
                :color="tag.color"
                :size="getTagSize(tag.articleCount)"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
                {{ tag.name }}
                <span class="count">({{ tag.articleCount || 0 }})</span>
              </el-tag>
            </div>
          </el-card>
        </div>
        
        <!-- 标签列表 -->
        <div class="tags-list-section">
          <el-card class="list-card">
            <template #header>
              <div class="card-header">
                <span>标签列表</span>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索标签..."
                  clearable
                  style="width: 200px"
                  @input="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </template>
            
            <el-table :data="filteredTags" style="width: 100%">
              <el-table-column prop="name" label="标签名称" min-width="120">
                <template #default="{ row }">
                  <el-tag :color="row.color" size="small">{{ row.name }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="articleCount" label="文章数量" width="100" align="center">
                <template #default="{ row }">
                  <el-badge :value="row.articleCount || 0" type="primary" />
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    link
                    @click="handleTagClick(row)"
                  >
                    查看文章
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { getTagList } from '@/api/tag'
import { formatDate } from '@/utils'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

// 数据
const tags = ref([])
const searchKeyword = ref('')

// 过滤后的标签
const filteredTags = computed(() => {
  if (!searchKeyword.value) {
    return tags.value
  }
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取标签大小
const getTagSize = (count) => {
  if (!count) return 'small'
  if (count > 20) return 'large'
  if (count > 10) return 'default'
  return 'small'
}

// 处理标签点击
const handleTagClick = (tag) => {
  router.push({
    path: '/articles',
    query: { tagId: tag.id }
  })
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
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

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tags-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #606266;
}

.tags-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

/* 标签云部分 */
.cloud-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  padding: 20px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.count {
  font-size: 0.8em;
  opacity: 0.8;
}

/* 标签列表部分 */
.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .tags-cloud {
    padding: 15px;
    gap: 10px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>
