<template>
  <div class="login-container">
    <!-- 左侧品牌区域 -->
    <div class="login-left">
      <div class="brand-header">
        <svg-icon name="logo" width="32px" height="32px" />
        <span class="brand-title">{{title}}</span>
      </div>

      <div class="illustration-area">
        <div class="floating-logo">
          <svg-icon name="logo" width="200px" height="200px" />
        </div>
      </div>

      <div class="brand-description close-to-logo">
        <h2>开箱即用的大型中后台管理系统</h2>
        <p>工作台、高准确、界面精美的后台模板</p>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="welcome-section">
          <h1>欢迎回来 👋</h1>
          <p>请输入您的账号信息以开始管理您的项目</p>
        </div>

        <t-form ref="formRef" :data="formData" :rules="formRules" class="login-form" @submit="handleLogin">
          <t-form-item name="userName">
            <t-input v-model="formData.userName" placeholder="请输入用户名" size="large" clearable>
              <template #prefix-icon>
                <t-icon name="user" />
              </template>
            </t-input>
          </t-form-item>

          <t-form-item name="password">
            <t-input v-model="formData.password" type="password" placeholder="请输入密码" size="large" clearable>
              <template #prefix-icon>
                <t-icon name="lock-on" />
              </template>
            </t-input>
          </t-form-item>

          <!-- 验证码预留位置 -->
          <t-form-item name="captcha" v-if="showCaptcha">
            <div class="captcha-container">
              <t-input v-model="formData.captcha" placeholder="请输入验证码" size="large" clearable>
                <template #prefix-icon>
                  <t-icon name="secured" />
                </template>
              </t-input>
              <div class="captcha-image">
                <!-- 验证码图片占位 -->
                <span>验证码</span>
              </div>
            </div>
          </t-form-item>

          <t-form-item>
            <div class="form-options">
              <t-checkbox v-model="rememberMe">记住账号</t-checkbox>
              <t-link theme="primary" hover="color">忘记密码？</t-link>
            </div>
          </t-form-item>

          <t-form-item>
            <t-button theme="primary" size="large" block :loading="loginLoading" @click="handleLogin">
              登录
            </t-button>
          </t-form-item>
        </t-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@/utils/ui'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import {settings} from "@/settings"

const title = ref(settings.title)
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单数据
const formData = reactive({
  userName: 'admin',
  password: '123456',
  captcha: ''
})

// 表单验证规则
const formRules = {
  userName: [
    { required: true, message: '请输入用户名', type: 'error' }
  ],
  password: [
    { required: true, message: '请输入密码', type: 'error' },
    { min: 6, message: '密码长度不能少于6位', type: 'error' }
  ]
}

// 其他状态
const formRef = ref()
const loginLoading = ref(false)
const rememberMe = ref(false)
const showCaptcha = ref(false) // 验证码显示控制

// 页面初始化
onMounted(() => {
  // 如果已经登录，重定向到首页
  if (userStore.isLoggedIn) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
    return
  }
  
  // 恢复记住的用户名
  const remembereduserName = localStorage.getItem('remembereduserName')
  if (remembereduserName) {
    formData.userName = remembereduserName
    rememberMe.value = true
  }
})

// 登录处理
const handleLogin = async () => {
  try {
    const validateResult = await formRef.value?.validate()
    if (validateResult === true) {
      loginLoading.value = true

      // 调用登录API
      const loginData = {
        userName: formData.userName,
        password: formData.password,
        captcha: formData.captcha
      }
      
      const result = await userStore.login(loginData)
      
      if (result.success) {
        Message.success('登录成功')
        
        // 处理记住账号
        if (rememberMe.value) {
          localStorage.setItem('remembereduserName', formData.userName)
        } else {
          localStorage.removeItem('remembereduserName')
        }
        
        // 获取重定向路径
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        Message.error(result.message || '登录失败')
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    Message.error('登录过程中发生错误，请稍后重试')
  } finally {
    loginLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(130deg, var(--td-bg-color-container-hover) 0%, var(--td-brand-color-light) 75%, var(--td-brand-color) 100%);
}

/* 左侧品牌区域 */
.login-left {
  width: 62%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--td-text-color-primary);
  position: relative;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  position: absolute;
  top: 20px;
  left: 20px;
}

.brand-title {
  font-size: 24px;
  font-weight: 600;
}

.illustration-area {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.floating-logo {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.brand-description {
  text-align: center;
}

.brand-description.close-to-logo {
  margin-top: 0;
}

.brand-description h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.brand-description p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 右侧登录表单区域 */
.login-right {
  flex: 1;
  background: var(--td-bg-color-container);
  display: flex;
  align-items: center;
}

.login-form-container {
  width: 90%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

.welcome-section p {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.5;
}

.login-form {
  width: 100%;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-image {
  width: 100px;
  height: 40px;
  background: var(--td-bg-color-component);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  cursor: pointer;
  user-select: none;
}

.captcha-image:hover {
  background: var(--td-bg-color-component-hover);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    min-height: 40vh;
    padding: 20px;
  }

  .login-right {
    width: 100%;
    padding: 20px;
  }

  .floating-logo svg {
    width: 120px !important;
    height: 120px !important;
  }

  .brand-description h2 {
    font-size: 20px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }
}
</style>