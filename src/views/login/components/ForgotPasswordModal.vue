<template>
  <a-modal
    v-model:open="modalVisible"
    title="重置密码"
    :footer="null"
    :width="600"
    :maskClosable="false"
    centered
    @cancel="handleClose"
  >
    <!-- 步骤条 -->
    <a-steps :current="currentStep" size="small" style="margin-bottom: 24px;">
      <a-step title="验证手机号" />
      <a-step title="输入验证码" />
      <a-step title="设置新密码" />
    </a-steps>

    <!-- 第一步：输入手机号 -->
    <a-form v-if="currentStep === 0" ref="step1Ref" :model="formData" :rules="step1Rules" layout="vertical">
      <a-form-item label="手机号" name="phone">
        <a-input
          v-model:value="formData.phone"
          size="large"
          placeholder="请输入注册时的手机号"
          :maxlength="11"
        >
          <template #prefix>
            <mobile-outlined />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="large" block :loading="sending" @click="handleSendCode">
          发送验证码
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 第二步：输入验证码 -->
    <a-form v-if="currentStep === 1" ref="step2Ref" :model="formData" :rules="step2Rules" layout="vertical">
      <a-form-item label="验证码" name="code">
        <a-input
          v-model:value="formData.code"
          size="large"
          placeholder="请输入短信验证码"
          :maxlength="codeLength"
        >
          <template #prefix>
            <safety-certificate-outlined />
          </template>
          <template #suffix>
            <a-button
              type="link"
              size="small"
              :disabled="countdown > 0 || sending"
              :loading="sending"
              @click="handleResendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '重新发送' }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="large" block @click="handleVerifyCode">
          下一步
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 第三步：设置新密码 -->
    <a-form v-if="currentStep === 2" ref="step3Ref" :model="formData" :rules="step3Rules" layout="vertical">
      <a-form-item label="新密码" name="newPassword">
        <a-input-password
          v-model:value="formData.newPassword"
          size="large"
          placeholder="请输入新密码（6-20个字符）"
          autocomplete="new-password"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item label="确认新密码" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          size="large"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="large" block :loading="loading" @click="handleResetPassword">
          确认重置
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 成功提示 -->
    <a-result
      v-if="currentStep === 3"
      status="success"
      title="密码重置成功"
      sub-title="请使用新密码登录"
    >
      <template #extra>
        <a-button type="primary" @click="handleClose">返回登录</a-button>
      </template>
    </a-result>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { MobileOutlined, SafetyCertificateOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from '@/utils'
import { sendSms } from '@/api/auth'
import { resetPassword } from '@/api/auth'
import { useVerifyCode } from '../composables/useVerifyCode'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  showCaptcha: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentStep = ref(0)
const loading = ref(false)
const step1Ref = ref()
const step2Ref = ref()
const step3Ref = ref()

const formData = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 复用 useVerifyCode 获取配置（倒计时自己管理，因为需要在发送后跳步骤）
const {
  sending,
  codeLength,
  requestSendVerifyCode
} = useVerifyCode({ showCaptcha: props.showCaptcha })

const countdown = ref(0)

// 表单校验规则
const step1Rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ]
}

const step2Rules = {
  code: [{ required: true, message: '请输入验证码' }]
}

const step3Rules = {
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (_, value) => {
        if (value !== formData.value.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }
    }
  ]
}

/**
 * 第一步：发送验证码（通过图形验证码）
 */
const handleSendCode = () => {
  step1Ref.value?.validate().then(() => {
    requestSendVerifyCode(formData.value.phone)
  })
}

/**
 * 图形验证码通过后，实际发送短信并进入第二步
 */
const onCaptchaSuccessInternal = async () => {
  try {
    sending.value = true
    const res = await sendSms({
      phone: formData.value.phone,
      templateCode: '100003'
    })
    if (res.code === 200) {
      message.success('验证码已发送')
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
      // 进入第二步
      currentStep.value = 1
    }
  } catch (e) {
    console.error('发送验证码失败:', e)
  } finally {
    sending.value = false
  }
}

/**
 * 第二步：重新发送验证码
 */
const handleResendCode = () => {
  requestSendVerifyCode(formData.value.phone)
}

/**
 * 第二步：验证码填写完毕，进入第三步
 */
const handleVerifyCode = () => {
  step2Ref.value?.validate().then(() => {
    currentStep.value = 2
  })
}

/**
 * 第三步：提交重置密码
 */
const handleResetPassword = async () => {
  await step3Ref.value?.validate()
  try {
    loading.value = true
    const res = await resetPassword({
      phone: formData.value.phone,
      code: formData.value.code,
      newPassword: formData.value.newPassword
    })
    if (res.code === 200) {
      currentStep.value = 3
    }
  } catch (e) {
    console.error('重置密码失败:', e)
  } finally {
    loading.value = false
  }
}

/**
 * 关闭弹窗并重置状态
 */
const handleClose = () => {
  modalVisible.value = false
}

// 关闭时重置
watch(() => props.visible, (val) => {
  if (!val) {
    setTimeout(() => {
      currentStep.value = 0
      formData.value = { phone: '', code: '', newPassword: '', confirmPassword: '' }
    }, 300)
  }
})

// 暴露给父组件（图形验证码回调）
defineExpose({ onCaptchaSuccess: onCaptchaSuccessInternal })
</script>
