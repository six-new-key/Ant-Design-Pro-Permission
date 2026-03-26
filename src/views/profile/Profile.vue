<template>
  <div class="profile-container">
    <!-- 顶部用户信息卡片 -->
    <a-card :bordered="false" class="profile-header-card">
      <div class="profile-header">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <a-upload
            :show-upload-list="false"
            :before-upload="handleBeforeUpload"
            :custom-request="handleUploadAvatar"
            accept="image/*"
          >
            <div class="avatar-wrapper">
              <a-avatar :size="100" :src="userStore.userData?.avatar || undefined" class="user-avatar">
                {{ userStore.userData?.userName?.charAt(0)?.toUpperCase() }}
              </a-avatar>
              <div class="avatar-overlay">
                <camera-outlined :style="{ fontSize: '24px' }" />
                <div class="overlay-text">更换头像</div>
              </div>
            </div>
          </a-upload>
          <h2 class="user-name">{{ userStore.userData?.userName }}</h2>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-icon">
              <mobile-outlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">手机号</div>
              <div class="stat-value">{{ userStore.userData?.phone || '-' }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <mail-outlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">邮箱</div>
              <div class="stat-value">{{ userStore.userData?.email || '-' }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <login-outlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">登录次数</div>
              <div class="stat-value">{{ userStore.userData?.loginCount || 0 }} 次</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <clock-circle-outlined />
            </div>
            <div class="stat-content">
              <div class="stat-label">最后登录</div>
              <div class="stat-value">{{ formatDateTime(userStore.userData?.lastLoginTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 表单区域 -->
    <a-row :gutter="24" style="margin-top: 24px;">
      <!-- 基本信息 -->
      <a-col :span="12">
        <a-card :bordered="false" title="基本信息" class="form-card">
          <template #extra>
            <user-outlined />
          </template>
          <a-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            layout="vertical"
          >
            <a-form-item label="用户名" name="userName">
              <a-input 
                v-model:value="basicForm.userName" 
                placeholder="请输入用户名（3-20个字符）"
                :maxlength="20"
                size="large"
              >
                <template #prefix>
                  <user-outlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="手机号" name="phone">
              <a-input 
                v-model:value="basicForm.phone" 
                placeholder="请输入手机号" 
                :maxlength="11"
                size="large"
                readonly
              >
                <template #prefix>
                  <mobile-outlined />
                </template>
                <template #suffix>
                  <a-button type="link" size="small" @click="showChangePhoneModal">
                    修改
                  </a-button>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="邮箱" name="email">
              <a-input 
                v-model:value="basicForm.email" 
                placeholder="请输入邮箱"
                size="large"
                readonly
              >
                <template #prefix>
                  <mail-outlined />
                </template>
                <template #suffix>
                  <a-button type="link" size="small" @click="showChangeEmailModal">
                    修改
                  </a-button>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="性别" name="gender">
              <DictRadio 
                v-model:value="basicForm.gender" 
                dict-type="gender" 
                value-type="number"
                size="large"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" size="large" :loading="basicLoading" @click="handleUpdateBasic">
                  <template #icon><save-outlined /></template>
                  保存修改
                </a-button>
                <a-button size="large" @click="handleResetBasic">
                  <template #icon><redo-outlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 修改密码 -->
      <a-col :span="12">
        <a-card :bordered="false" title="修改密码" class="form-card">
          <template #extra>
            <lock-outlined />
          </template>
          <a-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            layout="vertical"
          >
            <a-form-item label="旧密码" name="oldPassword">
              <a-input-password
                v-model:value="passwordForm.oldPassword"
                placeholder="请输入旧密码"
                autocomplete="current-password"
                size="large"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item label="新密码" name="newPassword">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码（6-20个字符）"
                autocomplete="new-password"
                size="large"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item label="确认新密码" name="confirmPassword">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
                autocomplete="new-password"
                size="large"
              >
                <template #prefix>
                  <lock-outlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" size="large" :loading="passwordLoading" @click="handleUpdatePassword">
                  <template #icon><check-outlined /></template>
                  确认修改
                </a-button>
                <a-button size="large" @click="handleResetPassword">
                  <template #icon><redo-outlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <!-- 修改手机号弹窗 -->
    <ChangePhoneModal v-model="changePhoneVisible" @success="handlePhoneChanged" />
    
    <!-- 修改邮箱弹窗 -->
    <ChangeEmailModal v-model="changeEmailVisible" @success="handleEmailChanged" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  CameraOutlined, 
  UserOutlined, 
  MobileOutlined, 
  MailOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  LockOutlined,
  SaveOutlined,
  RedoOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores'
import { updateProfile, updatePassword, uploadAvatar } from '@/api/user'
import { message } from '@/utils'
import { useDict } from '@/utils/useDict'
import { DICT_TYPES } from '@/constants/dictTypes'
import ChangePhoneModal from './components/ChangePhoneModal.vue'
import ChangeEmailModal from './components/ChangeEmailModal.vue'

const userStore = useUserStore()

// 使用字典
const { getLabel: getGenderLabel } = useDict(DICT_TYPES.GENDER)

const basicFormRef = ref()
const passwordFormRef = ref()
const basicLoading = ref(false)
const passwordLoading = ref(false)
const changePhoneVisible = ref(false)
const changeEmailVisible = ref(false)

// 基本信息表单
const basicForm = reactive({
  userName: '',
  phone: '',
  email: '',
  gender: 0,
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 基本信息校验规则
const basicRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// 密码校验规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 初始化表单数据
 */
const initFormData = () => {
  const userData = userStore.userData
  if (userData) {
    basicForm.userName = userData.userName
    basicForm.phone = userData.phone
    basicForm.email = userData.email
    basicForm.gender = userData.gender ?? 0
    basicForm.avatar = userData.avatar
  }
}

/**
 * 上传前校验
 */
const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

/**
 * 上传头像
 */
const handleUploadAvatar = async ({ file }) => {
  try {
    const res = await uploadAvatar(file)
    if (res.code === 200) {
      basicForm.avatar = res.data
      message.success('头像上传成功')
      // 立即更新到后端
      await updateProfile({
        userName: basicForm.userName,
        phone: basicForm.phone,
        email: basicForm.email,
        gender: basicForm.gender,
        avatar: basicForm.avatar
      })
      await userStore.getUserInfo()
    }
  } catch (error) {
    console.error('头像上传失败:', error)
  }
}

/**
 * 保存基本信息
 */
const handleUpdateBasic = async () => {
  await basicFormRef.value?.validate()
  try {
    basicLoading.value = true
    const res = await updateProfile({
      userName: basicForm.userName,
      phone: basicForm.phone,
      email: basicForm.email,
      gender: basicForm.gender,
      avatar: basicForm.avatar
    })
    if (res.code === 200) {
      message.success('个人信息更新成功')
      await userStore.getUserInfo()
      initFormData()
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
  } finally {
    basicLoading.value = false
  }
}

/**
 * 重置基本信息表单
 */
const handleResetBasic = () => {
  initFormData()
  basicFormRef.value?.clearValidate()
}

/**
 * 修改密码
 */
const handleUpdatePassword = async () => {
  await passwordFormRef.value?.validate()
  try {
    passwordLoading.value = true
    const res = await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    if (res.code === 200) {
      Modal.success({
        title: '密码修改成功',
        content: '请使用新密码重新登录',
        okText: '确定',
        centered: true,
        onOk: async () => {
          await userStore.handleLogout()
        }
      })
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

/**
 * 重置密码表单
 */
const handleResetPassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

/**
 * 显示修改手机号弹窗
 */
const showChangePhoneModal = () => {
  changePhoneVisible.value = true
}

/**
 * 手机号修改成功回调
 */
const handlePhoneChanged = () => {
  initFormData()
}

/**
 * 显示修改邮箱弹窗
 */
const showChangeEmailModal = () => {
  changeEmailVisible.value = true
}

/**
 * 邮箱修改成功回调
 */
const handleEmailChanged = () => {
  initFormData()
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped lang="scss">
.profile-header-card {
  margin-bottom: 24px;
  
  :deep(.ant-card-body) {
    padding: 32px;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 48px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 140px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  
  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.user-avatar {
  border: 3px solid var(--ant-color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  
  .overlay-text {
    margin-top: 4px;
    font-size: 12px;
  }
}

.user-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.stats-section {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--ant-color-fill-quaternary);
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: var(--ant-color-fill-tertiary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ant-color-primary-bg);
  color: var(--ant-color-primary);
  border-radius: 8px;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--ant-color-text);
  word-break: break-all;
}

.form-card {
  :deep(.ant-card-head) {
    border-bottom: 2px solid var(--ant-color-border);
  }
  
  :deep(.ant-card-head-title) {
    font-size: 18px;
    font-weight: 600;
  }
  
  :deep(.ant-card-body) {
    padding: 24px;
  }
}
</style>
