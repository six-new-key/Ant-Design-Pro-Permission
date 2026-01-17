<template>
    <a-modal v-model:open="visible" :footer="null" title="锁定屏幕" :width="400" :centered="true" :destroy-on-close="true" :maskClosable="themeStore.baseConfig.maskMode">

        <div class="lock-dialog-content">
            <!-- 用户头像和信息 -->
            <div class="user-section">
                <a-avatar :size="80" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vben" alt="用户头像"
                    class="user-avatar" />
                <div class="user-name">Admin</div>
            </div>

            <!-- 表单区域 -->
            <a-form ref="formRef" :model="formData" :rules="rules" @finish="handleLock">
                <!-- 密码输入区域 -->
                <a-form-item name="lockPassword">
                    <a-input-password v-model:value="formData.lockPassword" placeholder="请输入锁屏密码" size="large"
                        @keyup.enter="handleSubmit" ref="passwordInputRef" />
                </a-form-item>

                <!-- 锁定按钮 -->
                <a-form-item>
                    <a-button type="primary" size="large" block :loading="isLocking" @click="handleSubmit"
                        class="lock-btn">
                        锁定
                    </a-button>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, watch, reactive, nextTick } from 'vue'
import { useAppStore ,useThemeStore} from '@/stores'

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Store
const appStore = useAppStore()
const themeStore = useThemeStore()

// 响应式数据
const visible = ref(props.modelValue)
const isLocking = ref(false)
const formRef = ref()
const passwordInputRef = ref(null)

// 表单数据
const formData = reactive({
    lockPassword: ''
})

// 表单验证规则
const rules = {
    lockPassword: [
        { required: true, message: '请输入锁屏密码', trigger: ['blur', 'change'] },
        { min: 4, message: '密码长度至少4位', trigger: ['blur', 'change'] }
    ]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal
    if (newVal) {
        // 对话框打开时聚焦到密码输入框
        nextTick(() => {
            passwordInputRef.value?.focus()
        })
    }
})

// 监听 visible 变化
watch(visible, (newVal) => {
    emit('update:modelValue', newVal)
    if (!newVal) {
        // 对话框关闭时清空密码和重置表单
        formData.lockPassword = ''
        isLocking.value = false
        formRef.value?.resetFields()
    }
})

// 提交表单
const handleSubmit = async () => {
    // 先进行表单校验
    await formRef.value?.validate()
    // 校验通过后执行锁定操作
    await handleLock()
}

// 处理锁定
const handleLock = async () => {
    isLocking.value = true
    try {
        // 设置锁屏密码和状态
        await appStore.setLockScreen(formData.lockPassword)
        visible.value = false
    } finally {
        isLocking.value = false
    }
}
</script>

<style scoped lang="scss">

.lock-dialog-content {
    text-align: center;
    position: relative;

    .user-section {
        margin-bottom: 32px;

        .user-avatar {
            margin: 0 auto 16px;
            display: block;
        }

        .user-name {
            font-size: 20px;
            font-weight: bold;
        }
    }
}
</style>