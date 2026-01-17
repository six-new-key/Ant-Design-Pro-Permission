<template>
  <div class="lock-screen-overlay" id="screen-box">
    <!-- 底部信息 -->
    <div class="lock-screen-footer">
      <div class="system-info">
        <span>Ant Design Pro</span>
        <span class="separator">•</span>
        <span>{{ systemTimeWithWeek }}</span>
      </div>
    </div>
  </div>

  <!-- 解锁对话框 - 移到外层 -->
  <a-modal v-model:open="showUnlockDialog" title="解锁屏幕" :closable="false" :maskClosable="false" :keyboard="false"
           centered :width="400" :footer="null" :mask="false">
    <div class="dialog-user-info">
      <a-avatar :size="80" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vben" alt="用户头像"/>
      <div class="user-name">Super</div>
    </div>

    <a-form ref="formRef" :model="formData" :rules="rules" @finish="handleUnlock">
      <a-form-item name="unlockPassword">
        <a-input-password v-model:value="formData.unlockPassword" placeholder="请输入解锁密码" size="large"
                          @keyup.enter="handleSubmit" ref="passwordInputRef"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="large" :loading="isUnlocking" @click="handleSubmit" block>
          解锁
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="link" @click="handleReturnLogin" block>返回登录</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, reactive} from 'vue'
import {dynamicBgManager, generateThemeColors} from '@/utils'
import {message} from '@/utils'
import {useAppStore, useLoginStore, useThemeStore,useUserStore} from '@/stores'
import {logout} from "@/api";

// Store
const appStore = useAppStore()
const loginStore = useLoginStore()
const themeStore = useThemeStore()
const userStore = useUserStore()

// 响应式数据
const isUnlocking = ref(false)
const systemTimeWithWeek = ref('')
const passwordInputRef = ref(null)
const showUnlockDialog = ref(true) // 默认显示对话框
const formRef = ref()

// 表单数据
const formData = reactive({
  unlockPassword: ''
})

// 表单验证规则
const rules = {
  unlockPassword: [
    {required: true, message: '请输入解锁密码', trigger: ['blur', 'change']},
    {min: 4, message: '密码长度至少4位', trigger: ['blur', 'change']}
  ]
}

let dynamicBgInstance = null
// 时间更新定时器
let timeTimer = null

// 初始化时间显示
const initTime = () => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
}

// 更新时间
const updateTime = () => {
  const now = new Date()

  // 系统时间 (包含星期)
  systemTimeWithWeek.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }) + ' ' + now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 返回登录
const handleReturnLogin = async () => {

  // 调用退出登录接口
  await logout()

  // 清除锁屏状态和密码
  appStore.clearLockScreen()

  // 重置登录状态
  userStore.handleLogout()

  // 清空输入框和重置表单
  formData.unlockPassword = ''
  formRef.value?.resetFields()
  showUnlockDialog.value = false
}

// 提交表单
const handleSubmit = async () => {
  // 先进行表单校验
  await formRef.value?.validate()
  // 校验通过后执行解锁操作
  await handleUnlock()
}

// 处理解锁
const handleUnlock = async () => {
  isUnlocking.value = true

  try {
    const success = await appStore.unlockScreen(formData.unlockPassword)

    if (success) {
      message.success('解锁成功')
      formData.unlockPassword = ''
      showUnlockDialog.value = false
    } else {
      formData.unlockPassword = ''
      message.error('密码错误')
      formRef.value?.validateField('unlockPassword')

      // 聚焦到密码输入框
      await nextTick()
      passwordInputRef.value?.focus()
    }
  } finally {
    isUnlocking.value = false
  }
}

// 初始化动态背景
const initDynamicBackground = async () => {
  // 根据当前主题色生成渐变色数组
  const primaryColor = themeStore.primaryColorHex
  const themeColors = generateThemeColors(primaryColor)

  // 使用管理器创建动态背景
  dynamicBgInstance = dynamicBgManager.create(
      'screen-box',
      loginStore.selectedDynamicBg,
      {
        colors: themeColors,
        loop: true
      }
  )
}

// 销毁动态背景
const destroyDynamicBackground = async () => {
  await dynamicBgManager.destroy('screen-box')
  dynamicBgInstance = null
}

// 组件挂载
onMounted(() => {
  initDynamicBackground()
  initTime()
  // 对焦到密码输入框
  passwordInputRef.value?.focus()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  destroyDynamicBackground()
  if (timeTimer) {
    clearInterval(timeTimer)
    timeTimer = null
  }
})
</script>

<style scoped lang="scss">
.lock-screen-overlay {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  color: #284CE0;
}

// .lock-screen-bg {
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background-image: url('@/assets/image/bg.png');
//     background-size: cover;
//     background-position: center;
//     background-repeat: no-repeat;

//     .bg-blur {
//         position: absolute;
//         top: 0;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         background: rgba(0, 0, 0, 0.4);
//         backdrop-filter: blur(4px);
//     }
// }

.lock-screen-footer {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;

  .system-info {
    color: rgba(255, 255, 255);
    font-size: 18px;
    font-weight: bold;
    text-align: center;

    .separator {
      margin: 0 8px;
      opacity: 0.6;
    }
  }
}

// 对话框样式
.dialog-user-info {
  text-align: center;
  margin-bottom: 20px;

  .user-name {
    font-size: 20px;
    font-weight: bold;
  }
}
</style>