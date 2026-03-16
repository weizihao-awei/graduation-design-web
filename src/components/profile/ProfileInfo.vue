<template>
  <el-card>
    <template #header>
      <div class="section-header">
        <span>个人信息</span>
        <el-button v-if="!isEditing" type="primary" @click="handleEdit">
          <el-icon>
            <Edit />
          </el-icon>
          编辑
        </el-button>
      </div>
    </template>

    <div v-if="!isEditing" class="info-display">
      <div class="info-item">
        <span class="info-label">用户名</span>
        <span class="info-value">{{ infoForm.username || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">昵称</span>
        <span class="info-value">{{ infoForm.nickname || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">邮箱</span>
        <span class="info-value">{{ infoForm.email || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">性别</span>
        <span class="info-value">{{ getGenderText(infoForm.gender) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">个性签名</span>
        <span class="info-value">{{ infoForm.signature || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">简介</span>
        <span class="info-value">{{ infoForm.intro || '-' }}</span>
      </div>
    </div>

    <el-form v-else ref="infoFormRef" :model="infoForm" :rules="infoRules" label-width="80px"
      class="profile-form">
      <el-form-item label="用户名">
        <el-input v-model="infoForm.username" disabled />
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <div class="avatar-upload">
          <div class="avatar-preview" @click="handleUploadAvatar">
            <el-avatar :size="80" :src="getAvatarUrl(infoForm.avatar)">
              {{ infoForm.nickname?.charAt(0) }}
            </el-avatar>
            <div class="avatar-overlay">
              <el-icon>
                <Upload />
              </el-icon>
              <span>点击上传</span>
            </div>
          </div>
          <el-button type="primary" size="small" @click="handleUploadAvatar" :loading="uploading">
            选择图片
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="infoForm.nickname" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="infoForm.email" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="infoForm.gender">
          <el-radio :label="0">未知</el-radio>
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="个性签名" prop="signature">
        <el-input v-model="infoForm.signature" type="textarea" :rows="2" placeholder="请输入个性签名" />
      </el-form-item>

      <el-form-item label="简介" prop="intro">
        <el-input v-model="infoForm.intro" type="textarea" :rows="3" placeholder="请输入个人简介" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleUpdateInfo" :loading="updating">
          保存
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Upload } from '@element-plus/icons-vue'
import { updateUserInfo } from '@/api/user'
import { uploadImage, updateImage } from '@/api/image'

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update'])

const isEditing = ref(false)
const infoFormRef = ref()
const updating = ref(false)
const uploading = ref(false)

const infoForm = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: '',
  gender: 0,
  intro: '',
  signature: '',
  role: 0
})

const originalInfoForm = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: '',
  gender: 0,
  intro: '',
  signature: '',
  role: 0
})

const infoRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

watch(() => props.userInfo, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(infoForm, newVal)
    Object.assign(originalInfoForm, newVal)
  }
}, { immediate: true })

const handleEdit = () => {
  isEditing.value = true
  Object.assign(originalInfoForm, { ...infoForm })
}

const handleCancel = () => {
  isEditing.value = false
  Object.assign(infoForm, { ...originalInfoForm })
}

const getGenderText = (gender) => {
  const genderMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return genderMap[gender] || '未知'
}

const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return

  try {
    await infoFormRef.value.validate()
    updating.value = true

    await updateUserInfo(infoForm)

    emit('update', infoForm)

    isEditing.value = false
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
  } finally {
    updating.value = false
  }
}

const getAvatarUrl = (avatar) => {
  if (!avatar) return ''
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const cleanUri = avatar.startsWith('/api/') ? avatar.substring(4) : avatar
  return baseUrl + cleanUri
}

const handleUploadAvatar = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 10MB')
      return
    }

    uploading.value = true

    try {
      let uri
      const oldUri = infoForm.avatar

      if (oldUri) {
        const res = await updateImage('avatar', oldUri, file)
        uri = res.data.uri
      } else {
        const res = await uploadImage('avatar', file)
        uri = res.data.uri
      }

      infoForm.avatar = uri
      emit('update', { ...infoForm, avatar: uri })

      ElMessage.success('头像上传成功')
    } catch (error) {
      console.error('上传头像失败:', error)
      ElMessage.error('上传头像失败')
    } finally {
      uploading.value = false
    }
  }

  input.click()
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-display {
  padding: 20px 0;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #303133;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  position: relative;
  cursor: pointer;
  width: 80px;
  height: 80px;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>
