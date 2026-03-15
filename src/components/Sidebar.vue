<template>
  <aside class="sidebar">
    <div class="widget">
      <h3 class="widget-title">热门标签</h3>
      <div class="tags-cloud">
        <el-tag v-for="tag in hotTags" :key="tag.id" :color="tag.color" size="small" class="tag-item"
          @click="handleTagClick(tag)">
          {{ tag.name }}
        </el-tag>
      </div>
    </div>

    <div class="widget">
      <h3 class="widget-title">文章分类</h3>
      <ul class="category-list">
        <li v-for="category in categories" :key="category.id" class="category-item">
          <a href="javascript:;" @click="handleCategoryClick(category)">
            {{ category.name }}
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHotTags } from '@/api/tag'
import { getCategoryList } from '@/api/category'

const router = useRouter()

const hotTags = ref([])
const categories = ref([])

const handleTagClick = (tag) => {
  router.push({
    path: '/articles',
    query: { tagId: tag.id }
  })
}

const handleCategoryClick = (category) => {
  router.push({
    path: '/articles',
    query: { categoryId: category.id }
  })
}

const initData = async () => {
  try {
    const [tagsRes, categoriesRes] = await Promise.all([
      getHotTags(),
      getCategoryList()
    ])
    hotTags.value = tagsRes.data || []
    categories.value = categoriesRes.data || []
  } catch (error) {
    console.error('获取侧边栏数据失败:', error)
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.widget {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
}

.widget:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.widget-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-light);
  position: relative;
}

.widget-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--primary-color);
  border-radius: var(--border-radius-base);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag-item {
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);
  color: #2c3e50;
}

.tag-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-light);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-extra-light);
  transition: var(--transition-fast);
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  background: var(--bg-page);
  padding-left: var(--spacing-sm);
}

.category-item a {
  display: block;
  color: var(--text-regular);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition-fast);
  padding: var(--spacing-sm) 0;
}

.category-item a:hover {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
}
</style>
