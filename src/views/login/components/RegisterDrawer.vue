<template>
  <a-drawer
    v-model:open="drawerVisible"
    title="创建账号"
    placement="right"
    :width="500"
    :closable="true"
    @close="handleClose"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      autocomplete="off"
    >
      <!-- 用户名 -->
      <a-form-item label="用户名" name="userName">
        <a-input
          v-model:value="formData.userName"
          size="large"
          placeholder="请输入用户名（3-20个字符）"
          autocomplete="username"
        >
          <template #prefix>
            <user-outlined />
          </template>
        </a-input>
      </a-form-item>

      <!-- 密码 -->
      <a-form-item label="密码" name="password">
        <a-input-password
          v-model:value="formData.password"
          size="large"
          placeholder="请输入密码（6-20个字符）"
          autocomplete="new-password"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- 确认密码 -->
      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          size="large"
          placeholder="请再次输入密码"
          autocomplete="new-password"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- 手机号 -->
      <a-form-item label="手机号" name="phone">
        <a-input
          v-model:value="formData.phone"
          size="large"
          placeholder="请输入手机号"
          :maxlength="11"
          autocomplete="tel"
        >
          <template #prefix>
            <mobile-outlined />
          </template>
        </a-input>
      </a-form-item>

      <!-- 验证码 -->
      <a-form-item label="验证码" name="code">
        <a-input
          v-model:value="formData.code"
          size="large"
          placeholder="请输入验证码"
          :maxlength="codeLength"
        >
          <template #prefix>
            <safety-certificate-outlined />
          </template>
          <template #suffix>
            <a-button
              type="link"
              size="small"
              :disabled="isButtonDisabled(formData.phone)"
              :loading="sending"
              @click="handleSendCode"
            >
              {{ getButtonText() }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>

      <!-- 邮箱 -->
      <a-form-item label="邮箱" name="email">
        <a-input
          v-model:value="formData.email"
          size="large"
          placeholder="请输入邮箱"
          autocomplete="email"
        >
          <template #prefix>
            <mail-outlined />
          </template>
        </a-input>
      </a-form-item>

      <!-- 性别 -->
      <a-form-item label="性别">
        <a-radio-group v-model:value="formData.gender" size="large">
          <a-radio :value="0">未知</a-radio>
          <a-radio :value="1">男</a-radio>
          <a-radio :value="2">女</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 注册按钮 -->
      <a-form-item>
        <a-button
          type="primary"
          size="large"
          block
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </a-button>
      </a-form-item>

      <!-- 返回登录 -->
      <a-form-item>
        <div style="text-align: center;">
          <span style="color: var(--ant-color-text-secondary);">已有账号？</span>
          <a-button type="link" @click="handleClose">
            返回登录
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  MailOutlined
} from '@ant-design/icons-vue'
import { useRegisterForm } from '../composables/useRegisterForm'
import { useVerifyCode } from '../composables/useVerifyCode'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  codeLength: {
    type: Number,
    default: 6
  },
  showCaptcha: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success', 'captchaSuccess'])

// 抽屉显示状态
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 注册表单管理
const {
  formRef,
  formData,
  rules,
  loading,
  resetForm,
  submitRegister
} = useRegisterForm({ codeLength: computed(() => props.codeLength) })

// 验证码管理 - 创建独立的实例
const {
  sending,
  requestSendVerifyCode,
  onCaptchaSuccess,
  getButtonText,
  isButtonDisabled
} = useVerifyCode({ showCaptcha: props.showCaptcha })

/**
 * 发送验证码
 */
const handleSendCode = () => {
  requestSendVerifyCode(formData.phone)
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  const result = await submitRegister()
  
  if (result.success) {
    // 注册成功，通知父组件
    emit('success', result.userName)
    
    // 关闭抽屉
    drawerVisible.value = false
    
    // 重置表单
    resetForm()
  }
}

/**
 * 关闭抽屉
 */
const handleClose = () => {
  drawerVisible.value = false
  // 延迟重置表单，避免关闭动画时看到表单重置
  setTimeout(() => {
    resetForm()
  }, 300)
}

// 监听抽屉打开，重置表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 暴露 onCaptchaSuccess 方法给父组件
defineExpose({
  onCaptchaSuccess
})
</script>

<style scoped>
:deep(.ant-drawer-body) {
  padding: 24px;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>
