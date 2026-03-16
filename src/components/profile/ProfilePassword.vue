<template>
  <el-card>
    <template #header>
      <span>修改密码</span>
    </template>

    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px"
      class="profile-form">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请确认新密码" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleUpdatePassword" :loading="updating">
          修改密码
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { updatePassword } from '@/api/user'

const passwordFormRef = ref()
const updating = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    updating.value = true

    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')

    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
.profile-form {
  max-width: 500px;
}
</style>
