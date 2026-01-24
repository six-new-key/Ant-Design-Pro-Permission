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

        <a-form ref="formRef" :model="formData" :rules="rules">
          <!-- 用户名输入框 -->
          <a-form-item name="userName">
            <a-input v-model:value="formData.userName" size="large" placeholder="用户名">
            </a-input>
          </a-form-item>

          <!-- 密码输入框 -->
          <a-form-item name="password">
            <a-input-password v-model:value="formData.password" size="large" placeholder="密码">
            </a-input-password>
          </a-form-item>

          <!-- 图形验证码（登录失败3次后显示） -->
          <a-form-item v-if="showCaptcha" name="captchaCode">
            <div class="captcha-container">
              <a-input 
                v-model:value="formData.captchaCode" 
                size="large" 
                placeholder="请输入验证码"
                style="flex: 1; margin-right: 10px;"
              >
              </a-input>
              <div class="captcha-image" @click="refreshCaptcha">
                <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                <a-spin v-else />
              </div>
            </div>
          </a-form-item>

          <!-- 滑块验证 -->
          <a-form-item name="captcha">
            <drag-verify ref="dragVerify" :height="39.6" :width="438.4" :background="token.colorFillTertiary"
              :progressBarBg="token.colorSuccess + '90'" :handlerBg="token.colorBgContainer"
              :textSize="token.fontSize - 2 + 'px'" :textColor="token.colorText" :radius="token.borderRadius + 'px'"
              v-model:isPassing="formData.captcha" @passcallback="handleCaptchaPass" text="请按住滑块拖动" successText="验证通过">
            </drag-verify>
          </a-form-item>

          <!-- 记住账号和忘记密码 -->
          <a-form-item>
            <div class="options-row">
              <a-checkbox v-model:checked="formData.remember">
                记住账号
              </a-checkbox>
              <a-button type="link">
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
          <a-button type="text" class="tab-button">
            手机号登录
          </a-button>
          <a-button type="text" class="tab-button">
            扫码登录
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
          <a-button type="link">
            创建账号
          </a-button>
          <div class="copyright">
            Copyright © 2025 Ant Design Pro
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import router from '@/router'
import { theme } from 'ant-design-vue'
import { message, themeChangeWithAnimation, dynamicBgManager, generateThemeColors } from '@/utils'
import { settings } from '@/settings'
import { useLoginStore, useThemeStore, useAppStore, useUserStore } from '@/stores'
import DragVerify from '@/components/custom/DragVerify.vue'
import { generateCaptcha } from '@/api/captcha'
import { HOME_PATH } from '@/constants/routes'

// 使用 Ant Design Vue 的 design token
const { token } = theme.useToken()

const formRef = ref();
const appStore = useAppStore()
// 使用登录状态管理
const loginStore = useLoginStore()
// 使用主题状态管理
const themeStore = useThemeStore()
// 使用用户状态管理
const userStore = useUserStore()

//颜色复杂计算
const color = computed(() => {
  if (appStore.themeMode === 'dark') {
    return '#fff'
  } else {
    return '#555555'
  }
})
const dotColor = computed(() => themeStore.primaryColorHex)
const iconSize = computed(() => {
  return themeStore.baseConfig.fontSize + 8 + 'px'
})

const loading = ref(false)
let dynamicBgInstance = null

// 图片预加载功能
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = reject
    img.src = url
  })
}

// 预加载所有背景图片
const preloadBackgroundImages = async () => {
  const imagePromises = loginStore.staticBackgrounds.map(bg =>
    preloadImage(bg.url)
  )
  await Promise.all(imagePromises)
}

// 登录表单数据
const formData = reactive({
  userName: 'swx',
  password: '123456',
  captcha: false,
  remember: false,
  captchaId: '',
  captchaCode: ''
})

// 验证码相关
const showCaptcha = ref(false)
const captchaImage = ref('')

// 生成验证码
const loadCaptcha = async () => {
  try {
    const res = await generateCaptcha()
    if (res.code === 200) {
      formData.captchaId = res.data.captchaId
      captchaImage.value = res.data.captchaImage
    }
  } catch (error) {
    console.error('生成验证码失败:', error)
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  formData.captchaCode = ''
  loadCaptcha()
}

// 表单验证规则
const rules = computed(() => ({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  captcha: [
    {
      validator: (rule, value) => {
        if (!value) {
          return Promise.reject('请完成滑块验证')
        }
        return Promise.resolve()
      },
      trigger: ['change', 'blur']
    }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}))

// 处理滑块验证通过
const handleCaptchaPass = () => {
  formRef.value.clearValidate();
}

//登录容器计算
const loginContainerStyle = computed(() => ({
  width: loginStore.formPosition === 'left' ? '600px' : '520px',
  padding: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? '20px 40px' : loginStore.formPosition === 'left' ? '80px' : '80px 40px',
  height: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? 'auto' : '100vh',
  borderRadius: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? token.value.borderRadius + 30 + 'px' : '0px',
  marginBottomItem: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? '18px' : '24px',
  background: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? (loginStore.selectedVisualQuality === 'glass' ? 'transparent' : token.value.colorBgContainer) : token.value.colorBgContainer,
  boxShadow: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? (loginStore.selectedVisualQuality === 'glass' ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none') : 'none',
  // border: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' ? '1px solid ' + token.value.colorBorder : 'none',
}))

const controlPanelStyle = computed(() => ({
  background: appStore.themeMode === 'dark' ? token.value.colorFillTertiary : loginStore.backgroundMode === 'dynamic' ? '#fff' : loginStore.formPosition === 'right' ? token.value.colorFillTertiary : '#fff',
}))

// 处理登录
const doLogin = async () => {
  //校验
  await formRef.value.validate().then(async () => {
    loading.value = true
    // 校验通过，继续登录
    try {
      // 调用用户状态管理的登录方法
      const loginSuccess = await userStore.handleLogin(formData)
      if (loginSuccess) {
        // 登录成功，跳转到后台首页
        router.push(HOME_PATH)
      }
    } catch (error) {
      // 登录失败，检查是否需要显示验证码
      if (error.code === 10006 || error.code === 10007) {
        // 需要验证码
        showCaptcha.value = true
        loadCaptcha()
      }
    } finally {
      loading.value = false
    }
  })
}

// 处理动态背景切换
const handleDynamicBgChange = (bgId) => {
  loginStore.setBackgroundMode('dynamic')
  loginStore.setSelectedDynamicBg(bgId)
}

// 处理静态背景切换
const handleStaticBgChange = (bgId) => {
  loginStore.setBackgroundMode('static')
  loginStore.setSelectedStaticBg(bgId)
}

// 处理视觉风格切换
const handleVisualQualityChange = (bgId) => {
  loginStore.setVisualQuality(bgId)
}

// 处理表单位置切换
const handleFormPositionChange = ({ key }) => {
  loginStore.setFormPosition(key)
}

// 主题切换
const toggleThemeMode = (e) => {
  themeChangeWithAnimation(e, () => {
    appStore.setThemeMode(appStore.themeMode === 'dark' ? 'light' : 'dark')
  }, {
    themeMode: appStore.themeMode === 'dark' ? 'light' : 'dark'
  })
}

// 语言切换 - 占位符
const handleLanguageChange = ({ key }) => {
  appStore.setLanguage(key)
}

// 初始化动态背景
const initDynamicBackground = async () => {
  // 先销毁已有的动态背景
  await destroyDynamicBackground()

  // 根据当前主题色生成渐变色数组
  const primaryColor = themeStore.primaryColorHex
  const themeColors = generateThemeColors(primaryColor)

  // 使用管理器创建动态背景
  dynamicBgInstance = dynamicBgManager.create(
    'login-dynamic-bg',
    loginStore.selectedDynamicBg,
    {
      colors: themeColors,
      loop: true
    }
  )
}

// 切换动态背景类型
const switchDynamicBgType = (bgType) => {
  if (loginStore.isDynamicBackground) {
    // 根据当前主题色生成渐变色数组
    const primaryColor = themeStore.primaryColorHex
    const themeColors = generateThemeColors(primaryColor)

    dynamicBgInstance = dynamicBgManager.switchType(
      'login-dynamic-bg',
      bgType,
      {
        colors: themeColors,
        loop: true
      }
    )
  }
}

// 添加主题色更新函数
const updateDynamicBgColors = (newPrimaryColor) => {
  if (loginStore.isDynamicBackground && dynamicBgInstance) {
    const themeColors = generateThemeColors(newPrimaryColor)

    // 使用新颜色重新创建背景
    dynamicBgInstance = dynamicBgManager.switchType(
      'login-dynamic-bg',
      loginStore.selectedDynamicBg,
      {
        colors: themeColors,
        loop: true
      }
    )
  }
}

// 监听动态背景类型变化
watch(() => loginStore.selectedDynamicBg, (newBgType) => {
  switchDynamicBgType(newBgType)
})

watch(() => loginStore.isDynamicBackground, (newIsDynamicBg) => {
  if (newIsDynamicBg) {
    setTimeout(() => {
      initDynamicBackground()
    }, 4)
  }
})

// 监听主题色变化，自动更新动态背景色彩
watch(() => themeStore.primaryColorHex, (newPrimaryColor) => {
  if (loginStore.isDynamicBackground && dynamicBgInstance) {
    updateDynamicBgColors(newPrimaryColor)
  }
})

//监听主题变化
watch(() => appStore.themeMode, (newVal) => {
  if (loginStore.isDynamicBackground && newVal !== 'dark') {
    setTimeout(() => {
      initDynamicBackground()
    }, 4)
  }
})

// 销毁动态背景
const destroyDynamicBackground = async () => {
  await dynamicBgManager.destroy('login-dynamic-bg')
  dynamicBgInstance = null
}

// 组件挂载时初始化
onMounted(() => {
  initDynamicBackground()
  // 预加载背景图片
  preloadBackgroundImages()
})

// 组件卸载时清理
onUnmounted(() => {
  destroyDynamicBackground()
})
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 静态背景 */
.static-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 动态背景 */
.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
}

/* Logo区域 */
.logo-container {
  position: fixed;
  top: 20px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;

  .logo-text {
    margin-left: 10px;
    font-size: v-bind('token.fontSize + 8 + "px"');
    font-weight: 600;
    color: v-bind('token.colorText');
    opacity: 0.8;
  }
}

.logo-position-left {
  position: fixed;
  top: 22%;
  right: 20%;
  z-index: 1;

  .logo-svg {
    animation: float 2s ease-in-out infinite;
  }
}

.logo-position-right {
  position: fixed;
  top: 22%;
  left: 20%;
  z-index: 1;

  .logo-svg {
    animation: float 2s ease-in-out infinite;
  }
}

.description {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    opacity: 0.8;
    font-size: v-bind('token.fontSize + 10 + "px"');
    color: v-bind('token.colorText');
  }

  span {
    color: v-bind('token.colorText');
    opacity: 0.7;
    font-size: v-bind('token.fontSize + "px"');
  }
}


/* 功能控制区 */
.control-panel {
  position: fixed;
  top: 20px;
  right: 0;
  z-index: 1000;
  display: flex;
  background: v-bind('controlPanelStyle.background');
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;
  backdrop-filter: blur(10px);
  animation: fadeInDown 0.3s ease-out;

  .ant-btn {
    border-radius: 50px;
  }
}

/* 登录表单容器 */
.login-form-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

/* 表单位置样式 */
.form-position-left {
  justify-content: flex-start;
  padding-left: 0;
}

.form-position-center {
  justify-content: center;
}

.form-position-right {
  justify-content: flex-end;
  padding-right: 0;
}

/* 登录框 */
.login-box {
  user-select: none;
  width: 100%;
  max-width: v-bind('loginContainerStyle.width');
  height: v-bind('loginContainerStyle.height');
  background: v-bind('loginContainerStyle.background');
  backdrop-filter: blur(4px);
  //阴影
  box-shadow: v-bind('loginContainerStyle.boxShadow');
  border-radius: v-bind('loginContainerStyle.borderRadius');
  padding: v-bind('loginContainerStyle.padding');
  // border: v-bind('loginContainerStyle.border');
  border: 1px solid v-bind('token.colorBorder');
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;

  :where(.ant-form-item) {
    margin-bottom: v-bind('loginContainerStyle.marginBottomItem');
  }

  :where(.ant-input) {
    background: transparent;
  }

  :where(.ant-input-password) {
    background: transparent;
  }

  /* 登录头部 */
  .login-header {
    text-align: left;
    margin-bottom: 26px;

    .welcome-title {
      font-size: v-bind('token.fontSize + 20 + "px"');
      opacity: 0.9;
      font-weight: bold;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .welcome-subtitle {
      font-size: v-bind('token.fontSize + "px"');
      margin: 0;
      line-height: 1.4;
    }
  }

  /* 登录表单 */
  .options-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .ant-btn {
      padding: 0;
      margin: 0;
    }
  }

  .login-tabs {
    display: flex;
    justify-content: center;
    gap: 32px;

    .tab-button {
      border: 1px solid v-bind('token.colorBorder');
      width: 50%;
    }
  }

  .other-login {

    .ant-divider {
      opacity: 0.7;
      font-size: v-bind('token.fontSize - 2 + "px"');
    }

    .social-login {
      display: flex;
      justify-content: center;
      // gap: 2px;
    }
  }

  .login-footer {
    text-align: center;
    margin-top: 10px;

    span {
      opacity: 0.8;
      font-size: v-bind('token.fontSize + "px"');
      color: v-bind('token.colorText');
    }

    .ant-btn {
      padding: 0;
      margin: 0;
    }

    .copyright {
      margin-top: 16px;
      font-size: v-bind('token.fontSize - 3 + "px"');
      color: v-bind('token.colorTextSecondary');
    }
  }
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .captcha-image {
    width: 130px;
    height: 48px;
    border: 1px solid v-bind('token.colorBorder');
    border-radius: v-bind('token.borderRadius + "px"');
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      border-color: v-bind('token.colorPrimary');
      box-shadow: 0 0 0 2px v-bind('token.colorPrimary + "20"');
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 上下浮动动画 */
@keyframes float {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }

  100% {
    transform: translateY(0);
  }
}
</style>