<template>
  <div class="login-container">
    <!-- 静态背景 -->
    <div v-if="loginStore.isStaticBackground" class="static-background"
      :style="appStore.themeMode === 'dark' ? { background: token.colorBgContainer } : { backgroundImage: `url(${loginStore.currentBackgroundUrl})` }">
    </div>

    <!-- 动态背景容器 -->
    <div v-if="loginStore.isDynamicBackground && appStore.themeMode !== 'dark'" id="login-dynamic-bg"
      class="dynamic-background">
    </div>

    <div v-if="appStore.themeMode == 'dark'" class="dynamic-background" :style="{ background: token.colorBgContainer }">
    </div>

    <!-- Logo区域 -->
    <div class="logo-container">
      <DingdingOutlined :style="{ color: token.colorPrimary, fontSize: '44px' }" />
      <div class="logo-text">
        {{ settings.projectName }}
      </div>
    </div>

    <!-- Logo左侧或右侧区域 -->
    <div v-if="loginStore.formPosition !== 'center' && loginStore.backgroundMode === 'static'"
      :class="{ 'logo-position-left': loginStore.formPosition === 'left', 'logo-position-right': loginStore.formPosition === 'right' }">
      <div class="logo-svg">
        <svg-icon name="logo_position" width="380px" height="380px" />
      </div>
      <div class="description">
        <h2>开箱即用的大型中后台管理系统</h2>
        <span>工程化、高性能、跨组件库的前端模版</span>
      </div>
    </div>

    <!-- 功能控制区 -->
    <div class="control-panel">
      <a-dropdown placement="bottomRight">
        <a-button size="large" type="text" :style="{ color: token.colorTextSecondary }">
          <template #icon>
            <bg-colors-outlined style="font-size: 14px;" />
          </template>
        </a-button>
        <template #overlay>
          <a-menu>
            <a-sub-menu
              :style="{ background: loginStore.backgroundMode === 'dynamic' ? token.colorPrimary + 20 : '', borderRadius: token.borderRadius + 'px' }"
              key="dynamic" title="动态背景">
              <a-menu-item v-for="bg in loginStore.dynamicBackgrounds" :key="`dynamic-${bg.id}`"
                @click="handleDynamicBgChange(bg.id)">
                <template #icon>
                  <svg-icon :style="{ opacity: loginStore.selectedDynamicBg === bg.id ? 1 : 0 }" :color="dotColor"
                    name="dot" :width="iconSize" :height="iconSize" />
                </template>
                <span>{{ bg.name }}</span>
              </a-menu-item>
            </a-sub-menu>
            <a-sub-menu
              :style="{ background: loginStore.backgroundMode === 'static' ? token.colorPrimary + 20 : '', borderRadius: token.borderRadius + 'px' }"
              key="static" title="静态背景">
              <a-menu-item v-for="bg in loginStore.staticBackgrounds" :key="`static-${bg.id}`"
                @click="handleStaticBgChange(bg.id)">
                <template #icon>
                  <svg-icon :style="{ opacity: loginStore.selectedStaticBg === bg.id ? 1 : 0 }" :color="dotColor"
                    name="dot" :width="iconSize" :height="iconSize" />
                </template>
                <span>{{ bg.name }}</span>
              </a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="visualQuality" title="视觉风格">
              <a-menu-item v-for="bg in loginStore.visualQualities" :key="bg.id"
                @click="handleVisualQualityChange(bg.id)">
                <template #icon>
                  <svg-icon :style="{ opacity: loginStore.selectedVisualQuality === bg.id ? 1 : 0 }" :color="dotColor"
                    name="dot" :width="iconSize" :height="iconSize" />
                </template>
                <span>{{ bg.name }}</span>
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </template>
      </a-dropdown>

      <a-dropdown v-if="loginStore.isStaticBackground" placement="bottomRight">
        <a-button size="large" type="text" :style="{ color: token.colorTextSecondary }">
          <template #icon>
            <layout-outlined style="font-size: 14px;" />
          </template>
        </a-button>
        <template #overlay>
          <a-menu @click="handleFormPositionChange">
            <a-menu-item key="left">
              <template #icon>
                <svg-icon :style="{ opacity: loginStore.formPosition === 'left' ? 1 : 0 }" :color="dotColor" name="dot"
                  :width="iconSize" :height="iconSize" />
              </template>
              <span>左侧</span>
            </a-menu-item>
            <a-menu-item key="center">
              <template #icon>
                <svg-icon :style="{ opacity: loginStore.formPosition === 'center' ? 1 : 0 }" :color="dotColor"
                  name="dot" :width="iconSize" :height="iconSize" />
              </template>
              <span>居中</span>
            </a-menu-item>
            <a-menu-item key="right">
              <template #icon>
                <svg-icon :style="{ opacity: loginStore.formPosition === 'right' ? 1 : 0 }" :color="dotColor" name="dot"
                  :width="iconSize" :height="iconSize" />
              </template>
              <span>右侧</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <a-button size="large" type="text" @click="toggleThemeMode" :style="{ color: token.colorTextSecondary }">
        <template #icon>
          <svg-icon :name="appStore.themeMode === 'dark' ? 'sun' : 'moon'" width="16px" height="16px"
            :color="token.colorTextSecondary" />
        </template>
      </a-button>

      <a-dropdown placement="bottomRight">
        <a-button size="large" type="text" :style="{ color: token.colorTextSecondary }">
          <template #icon>
            <svg-icon name="language" width="16px" height="16px" :color="color" />
          </template>
        </a-button>
        <template #overlay>
          <a-menu @click="handleLanguageChange">
            <a-menu-item key="zh-cn">
              <template #icon>
                <svg-icon :style="{ opacity: appStore.language === 'zh-cn' ? 1 : 0 }" :color="dotColor" name="dot"
                  :width="iconSize" :height="iconSize" />
              </template>
              <span>中文</span>
            </a-menu-item>
            <a-menu-item key="en">
              <template #icon>
                <svg-icon :style="{ opacity: appStore.language === 'en' ? 1 : 0 }" :color="dotColor" name="dot"
                  :width="iconSize" :height="iconSize" />
              </template>
              <span>English</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 登录表单容器 -->
    <div :class="loginStore.formContainerClass">
      <div class="login-box">
        <div class="login-header">
          <h1 class="welcome-title" :style="{ color: token.colorText }">
            欢迎回来 👋
          </h1>
          <p class="welcome-subtitle" :style="{ color: token.colorTextSecondary }">
            请输入您的账户信息以开始管理您的项目
          </p>
        </div>

        <a-form ref="formRef" :model="formData" :rules="rules" autocomplete="on">
          <!-- 密码登录表单 -->
          <template v-if="loginType === 'password'">
            <!-- 用户名输入框 -->
            <a-form-item name="userName">
              <a-input 
                v-model:value="formData.userName" 
                name="username"
                autocomplete="username"
                size="large" 
                placeholder="用户名"
              />
            </a-form-item>

            <!-- 密码输入框 -->
            <a-form-item name="password">
              <a-input-password 
                v-model:value="formData.password" 
                name="password"
                autocomplete="current-password"
                size="large" 
                placeholder="密码"
              />
            </a-form-item>

            <!-- 滑块验证（装饰性） -->
            <a-form-item name="captcha">
              <drag-verify ref="dragVerify" :height="39.6" :width="438.4" :background="token.colorFillTertiary"
                :progressBarBg="token.colorSuccess + '90'" :handlerBg="token.colorBgContainer"
                :textSize="token.fontSize - 2 + 'px'" :textColor="token.colorText" :radius="token.borderRadius + 'px'"
                v-model:isPassing="formData.captcha" @passcallback="handleCaptchaPass" text="请按住滑块拖动" successText="验证通过">
              </drag-verify>
            </a-form-item>
          </template>

          <!-- 验证码登录表单 -->
          <template v-else>
            <!-- 手机号输入框 -->
            <a-form-item name="phone">
              <a-input 
                v-model:value="formData.phone" 
                size="large" 
                placeholder="请输入手机号"
                :maxlength="11"
              >
                <template #prefix>
                  <mobile-outlined />
                </template>
              </a-input>
            </a-form-item>

            <!-- 验证码输入框 -->
            <a-form-item name="code">
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
          </template>
          
          <!-- 官方Verify组件 -->
          <Verify
            ref="verifyRef"
            :mode="'pop'"
            :captchaType="captchaType"
            :imgSize="{ width: '330px', height: '155px' }"
            @success="handleVerifySuccess"
          />

          <!-- 记住账号和忘记密码 -->
          <a-form-item v-if="loginType === 'password'">
            <div class="options-row">
              <a-checkbox v-model:checked="formData.remember">
                  记住我
                </a-checkbox>
              <a-button type="link" @click="showForgotPassword = true">
                忘记密码?
              </a-button>
            </div>
          </a-form-item>

          <!-- 登录按钮 -->
          <a-form-item>
            <a-button type="primary" @click="doLogin" size="large" :loading="loading" block>
              登录
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 登录方式选择 -->
        <div class="login-tabs">
          <a-button 
            type="text" 
            :class="['tab-button', { active: loginType === 'verifyCode' }]"
            @click="switchLoginType('verifyCode')"
          >
            验证码登录
          </a-button>
          <a-button 
            type="text" 
            :class="['tab-button', { active: loginType === 'password' }]"
            @click="switchLoginType('password')"
          >
            账号密码登录
          </a-button>
        </div>

        <!-- 其他登录方式 -->
        <div class="other-login">
          <a-divider :style="{ borderColor: token.colorBorder }">其他登录方式</a-divider>
          <div class="social-login">
            <a-button type="text" shape="circle">
              <template #icon>
                <WechatOutlined />
              </template>
            </a-button>
            <a-button type="text" shape="circle">
              <template #icon>
                <AlipayCircleOutlined />
              </template>
            </a-button>
            <a-button type="text" shape="circle">
              <template #icon>
                <QqOutlined />
              </template>
            </a-button>
            <a-button type="text" shape="circle">
              <template #icon>
                <github-outlined />
              </template>
            </a-button>
            <a-button type="text" shape="circle">
              <template #icon>
                <TaobaoCircleOutlined />
              </template>
            </a-button>
            <a-button type="text" shape="circle">
              <template #icon>
                <DingdingOutlined />
              </template>
            </a-button>
          </div>
        </div>

        <!-- 注册链接 -->
        <div class="login-footer">
          <span>还没有账号？</span>
          <a-button type="link" @click="showRegister = true">
            创建账号
          </a-button>
          <div class="copyright">
            Copyright © 2025 Ant Design Pro
          </div>
        </div>
      </div>
    </div>
    
    <!-- 注册抽屉 -->
    <RegisterDrawer
      ref="registerDrawerRef"
      v-model:visible="showRegister"
      :code-length="codeLength"
      :show-captcha="showCaptcha"
      @success="handleRegisterSuccess"
    />

    <!-- 忘记密码弹窗 -->
    <ForgotPasswordModal
      ref="forgotPasswordModalRef"
      v-model:visible="showForgotPassword"
      :show-captcha="showCaptcha"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { settings } from '@/settings'
import { useLoginStore, useAppStore } from '@/stores'
import DragVerify from '@/components/custom/DragVerify.vue'
import Verify from '@/components/verifition/Verify.vue'
import RegisterDrawer from './components/RegisterDrawer.vue'
import ForgotPasswordModal from './components/ForgotPasswordModal.vue'

// Composables
import { useLoginForm } from './composables/useLoginForm'
import { useLoginAuth } from './composables/useLoginAuth'
import { useCaptcha } from './composables/useCaptcha'
import { useVerifyCode } from './composables/useVerifyCode'
import { useBackgroundControl } from './composables/useBackgroundControl'
import { useThemeControl } from './composables/useThemeControl'
import { useLoginStyles } from './composables/useLoginStyles'

const appStore = useAppStore()
const loginStore = useLoginStore()

// 注册抽屉显示状态和引用
const showRegister = ref(false)
const registerDrawerRef = ref()

// 忘记密码弹窗
const showForgotPassword = ref(false)
const forgotPasswordModalRef = ref()

// ==================== 组合各个功能模块 ====================

// 样式计算
const {
  token,
  loginContainerStyle,
  controlPanelStyle
} = useLoginStyles()

// 验证码管理（图形验证码）- 先初始化以获取 showCaptcha 方法
const {
  dragVerify,
  verifyRef,
  captchaType,
  handleVerifySuccess: onVerifySuccess,
  handleCaptchaPass: onCaptchaPass,
  showCaptcha,
  resetCaptcha
} = useCaptcha()

// 验证码管理（短信验证码）- 传入 showCaptcha 方法
const {
  countdown,
  sending,
  codeLength,
  countdownTime,
  requestSendVerifyCode,
  onCaptchaSuccess,
  getButtonText,
  isButtonDisabled
} = useVerifyCode({ showCaptcha })

// 表单管理 - 传入 codeLength 用于动态验证
const {
  formRef,
  formData,
  rules,
  loginType,
  switchLoginType,
  resetForm,
  validateForm,
  saveRememberedUsername
} = useLoginForm({ codeLength })

// 登录认证
const {
  loading,
  doLogin: performLogin,
  doVerifyCodeLogin: performVerifyCodeLogin
} = useLoginAuth()

// 背景控制
const {
  handleDynamicBgChange,
  handleStaticBgChange,
  handleVisualQualityChange,
  handleFormPositionChange
} = useBackgroundControl()

// 主题控制
const {
  color,
  dotColor,
  iconSize,
  toggleThemeMode,
  handleLanguageChange
} = useThemeControl()

// ==================== 事件处理器 ====================

/**
 * 图形验证成功回调
 */
const handleVerifySuccess = (params) => {
  // 保存验证token（用于密码登录）
  onVerifySuccess(params, formData)
  
  // 判断当前场景
  if (loginType.value === 'verifyCode') {
    // 验证码登录场景，触发发送短信验证码
    onCaptchaSuccess()
  } else if (showForgotPassword.value && forgotPasswordModalRef.value) {
    // 忘记密码场景
    forgotPasswordModalRef.value.onCaptchaSuccess()
  } else if (showRegister.value && registerDrawerRef.value) {
    // 注册场景，调用注册抽屉的验证码发送方法
    registerDrawerRef.value.onCaptchaSuccess()
  }
  
  // 验证成功后立即关闭弹窗，避免自动刷新
  setTimeout(() => {
    if (verifyRef.value) {
      verifyRef.value.hide?.()
    }
  }, 100)
}

/**
 * 滑块验证通过
 */
const handleCaptchaPass = () => {
  onCaptchaPass(formRef)
}

/**
 * 处理登录
 */
const doLogin = async () => {
  try {
    if (loginType.value === 'password') {
      // 密码登录
      await performLogin(formData, validateForm, showCaptcha, saveRememberedUsername)
    } else {
      // 验证码登录
      await performVerifyCodeLogin(formData, validateForm)
    }
  } catch (error) {
    // 登录失败，重置验证码
    resetForm()
    resetCaptcha()
  }
}

/**
 * 发送验证码（先弹出图形验证码）
 */
const handleSendCode = () => {
  requestSendVerifyCode(formData.phone)
}

/**
 * 处理注册成功
 */
const handleRegisterSuccess = (userName) => {
  // 关闭注册抽屉
  showRegister.value = false
  
  // 自动填充用户名到登录表单
  formData.userName = userName
  
  // 切换到密码登录模式
  switchLoginType('password')
}
</script>

<style lang="scss" scoped>
/* 引入静态样式（保持 scoped 作用域） */
@import './styles/login.scss';

/* 需要动态绑定的样式（使用 v-bind） */
.logo-container .logo-text {
  font-size: v-bind('token.fontSize + 8 + "px"');
  color: v-bind('token.colorText');
}

.description {
  h2 {
    font-size: v-bind('token.fontSize + 10 + "px"');
    color: v-bind('token.colorText');
  }

  span {
    color: v-bind('token.colorText');
    font-size: v-bind('token.fontSize + "px"');
  }
}

.control-panel {
  background: v-bind('controlPanelStyle.background');
}

.login-box {
  max-width: v-bind('loginContainerStyle.width');
  height: v-bind('loginContainerStyle.height');
  background: v-bind('loginContainerStyle.background');
  box-shadow: v-bind('loginContainerStyle.boxShadow');
  border-radius: v-bind('loginContainerStyle.borderRadius');
  padding: v-bind('loginContainerStyle.padding');
  border: 1px solid v-bind('token.colorBorder');

  :where(.ant-form-item) {
    margin-bottom: v-bind('loginContainerStyle.marginBottomItem');
  }

  .login-header {
    .welcome-title {
      font-size: v-bind('token.fontSize + 20 + "px"');
      color: v-bind('token.colorText');
    }

    .welcome-subtitle {
      font-size: v-bind('token.fontSize + "px"');
      color: v-bind('token.colorTextSecondary');
    }
  }

  .login-tabs .tab-button {
    border: 1px solid v-bind('token.colorBorder');

    &.active {
      color: v-bind('token.colorPrimary');
      border-color: v-bind('token.colorPrimary');
      background: v-bind('token.colorPrimary + "10"');
    }
  }

  .other-login {
    .ant-divider {
      font-size: v-bind('token.fontSize - 2 + "px"');
    }
  }

  .login-footer {
    span {
      font-size: v-bind('token.fontSize + "px"');
      color: v-bind('token.colorText');
    }

    .copyright {
      font-size: v-bind('token.fontSize - 3 + "px"');
      color: v-bind('token.colorTextSecondary');
    }
  }
}

.captcha-trigger {
  border: 1px solid v-bind('token.colorBorder');
  border-radius: v-bind('token.borderRadius + "px"');

  &:hover {
    border-color: v-bind('token.colorPrimary');
    box-shadow: 0 0 0 2px v-bind('token.colorPrimary + "20"');
  }

  .captcha-icon {
    color: v-bind('token.colorTextSecondary');
  }

  .captcha-text {
    font-size: v-bind('token.fontSize + "px"');
    color: v-bind('token.colorText');

    .verified {
      color: v-bind('token.colorSuccess');
    }
  }

  .captcha-arrow {
    color: v-bind('token.colorTextSecondary');
  }
}
</style>