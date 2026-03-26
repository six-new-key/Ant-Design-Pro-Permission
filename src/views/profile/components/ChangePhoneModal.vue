<template>
  <a-modal
    v-model:open="visible"
    title="修改手机号"
    :footer="null"
    :width="500"
    :maskClosable="false"
    centered
    @cancel="handleClose"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <!-- 新手机号 -->
      <a-form-item label="新手机号" name="phone">
        <a-input
          v-model:value="formData.phone"
          placeholder="请输入新手机号"
          :maxlength="11"
          size="large"
          :disabled="verified"
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
          placeholder="请输入验证码"
          :maxlength="6"
          size="large"
          :disabled="verified"
        >
          <template #prefix>
            <safety-certificate-outlined />
          </template>
          <template #suffix>
            <a-button
              type="link"
              size="small"
              :disabled="isButtonDisabled || verified"
              :loading="sending"
              @click="handleSendCode"
            >
              {{ getButtonText() }}
            </a-button>
          </template>
        </a-input>
      </a-form-item>

      <!-- 操作按钮 -->
      <a-form-item>
        <a-space style="width: 100%;" direction="vertical" :size="12">
          <a-button
            v-if="!verified"
            type="primary"
            size="large"
            block
            :loading="verifying"
            @click="handleVerify"
          >
            验证
          </a-button>
          <a-button
            v-else
            type="primary"
            size="large"
            block
            :loading="submitting"
            @click="handleSubmit"
          >
            确认修改
          </a-button>
          <a-button size="large" block @click="handleClose">
            取消
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { MobileOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue'
import { sendSms, verifySms } from '@/api/auth'
import { updateProfile } from '@/api/user'
import { message } from '@/utils'
import { useUserStore } from '@/stores'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const userStore = useUserStore()
const formRef = ref()
const sending = ref(false)
const verifying = ref(false)
const submitting = ref(false)
const verified = ref(false)
const countdown = ref(0)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formData = reactive({
  phone: '',
  code: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const isButtonDisabled = computed(() => {
  return !formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone) || countdown.value > 0
})

const getButtonText = () => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后重试`
  }
  return '获取验证码'
}

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  try {
    await formRef.value?.validateFields(['phone'])
    sending.value = true
    
    const res = await sendSms({
      phone: formData.phone,
      templateCode: '100004' // 绑定新手机号模板
    })
    
    if (res.code === 200) {
      message.success('验证码已发送')
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    sending.value = false
  }
}

/**
 * 验证验证码
 */
const handleVerify = async () => {
  try {
    await formRef.value?.validate()
    verifying.value = true
    
    const res = await verifySms({
      phone: formData.phone,
      code: formData.code,
      templateCode: '100004'
    })
    
    if (res.code === 200) {
      message.success('验证成功')
      verified.value = true
    }
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    verifying.value = false
  }
}

/**
 * 提交修改
 */
const handleSubmit = async () => {
  try {
    submitting.value = true
    
    const res = await updateProfile({
      userName: userStore.userData.userName,
      phone: formData.phone,
      email: userStore.userData.email,
      gender: userStore.userData.gender,
      avatar: userStore.userData.avatar
    })
    
    if (res.code === 200) {
      message.success('手机号修改成功')
      await userStore.getUserInfo()
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('修改手机号失败:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  visible.value = false
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.phone = ''
  formData.code = ''
  verified.value = false
  countdown.value = 0
  formRef.value?.clearValidate()
}

// 监听弹窗关闭，重置表单
watch(visible, (val) => {
  if (!val) {
    setTimeout(resetForm, 300)
  }
})
</script>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 20px;
}
</style>
