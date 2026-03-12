<template>
  <el-dialog
    v-model="dialogVisible"
    title="发布文章"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="publish-form"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入文章标题"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="文章摘要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          placeholder="请输入文章摘要"
          maxlength="500"
          show-word-limit
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="封面图片" prop="coverImage">
        <el-input
          v-model="formData.coverImage"
          placeholder="请输入封面图片URL"
        />
        <div v-if="formData.coverImage" class="cover-preview">
          <img :src="formData.coverImage" alt="封面预览" @error="handleImageError">
        </div>
      </el-form-item>

      <el-form-item label="文章分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择分类" clearable style="width: 100%">
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
          v-model="formData.tagIds"
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

      <el-form-item label="文章设置">
        <div class="settings-row">
          <el-checkbox v-model="formData.isTop">置顶文章</el-checkbox>
          <el-checkbox v-model="formData.isRecommend">推荐文章</el-checkbox>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          {{ loading ? '发布中...' : '确认发布' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  articleData: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(false)
const formRef = ref()
const loading = ref(false)

const formData = reactive({
  title: '',
  summary: '',
  coverImage: '',
  categoryId: null,
  tagIds: [],
  isTop: false,
  isRecommend: false
})

const formRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入文章摘要', trigger: 'blur' },
    { max: 500, message: '摘要长度不能超过500个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.articleData, (data) => {
  if (data && Object.keys(data).length > 0) {
    Object.assign(formData, {
      title: data.title || '',
      summary: data.summary || '',
      coverImage: data.coverImage || '',
      categoryId: data.categoryId || null,
      tagIds: data.tagIds || [],
      isTop: data.isTop || false,
      isRecommend: data.isRecommend || false
    })
  }
}, { immediate: true, deep: true })

const handleImageError = (e) => {
  if (!e.target.dataset.errorHandled) {
    e.target.dataset.errorHandled = 'true'
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"%3E%3Crect fill="%23f0f0f0" width="200" height="120"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无封面%3C/text%3E%3C/svg%3E'
  }
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const publishData = {
      ...formData,
      isTop: formData.isTop ? 1 : 0,
      isRecommend: formData.isRecommend ? 1 : 0
    }

    emit('confirm', publishData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.publish-form {
  padding: 20px 0;
}

.cover-preview {
  margin-top: 10px;
  width: 200px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-row {
  display: flex;
  gap: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
