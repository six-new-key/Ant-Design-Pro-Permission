import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useLoginStore, useThemeStore, useAppStore } from '@/stores'
import { dynamicBgManager, generateThemeColors } from '@/utils'

/**
 * 背景控制管理（动态/静态背景）
 */
export function useBackgroundControl() {
  const loginStore = useLoginStore()
  const themeStore = useThemeStore()
  const appStore = useAppStore()
  
  let dynamicBgInstance = null

  /**
   * 图片预加载功能
   */
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 预加载所有背景图片
   */
  const preloadBackgroundImages = async () => {
    const imagePromises = loginStore.staticBackgrounds.map(bg =>
      preloadImage(bg.url)
    )
    await Promise.all(imagePromises)
  }

  /**
   * 初始化动态背景
   */
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

  /**
   * 切换动态背景类型
   */
  const switchDynamicBgType = (bgType) => {
    if (loginStore.isDynamicBackground) {
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

  /**
   * 更新动态背景颜色
   */
  const updateDynamicBgColors = (newPrimaryColor) => {
    if (loginStore.isDynamicBackground && dynamicBgInstance) {
      const themeColors = generateThemeColors(newPrimaryColor)

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

  /**
   * 销毁动态背景
   */
  const destroyDynamicBackground = async () => {
    await dynamicBgManager.destroy('login-dynamic-bg')
    dynamicBgInstance = null
  }

  /**
   * 处理动态背景切换
   */
  const handleDynamicBgChange = (bgId) => {
    loginStore.setBackgroundMode('dynamic')
    loginStore.setSelectedDynamicBg(bgId)
  }

  /**
   * 处理静态背景切换
   */
  const handleStaticBgChange = (bgId) => {
    loginStore.setBackgroundMode('static')
    loginStore.setSelectedStaticBg(bgId)
  }

  /**
   * 处理视觉风格切换
   */
  const handleVisualQualityChange = (bgId) => {
    loginStore.setVisualQuality(bgId)
  }

  /**
   * 处理表单位置切换
   */
  const handleFormPositionChange = ({ key }) => {
    loginStore.setFormPosition(key)
  }

  // 监听动态背景类型变化
  watch(() => loginStore.selectedDynamicBg, (newBgType) => {
    switchDynamicBgType(newBgType)
  })

  // 监听是否为动态背景
  watch(() => loginStore.isDynamicBackground, (newIsDynamicBg) => {
    if (newIsDynamicBg) {
      setTimeout(() => {
        initDynamicBackground()
      }, 4)
    }
  })

  // 监听主题色变化
  watch(() => themeStore.primaryColorHex, (newPrimaryColor) => {
    if (loginStore.isDynamicBackground && dynamicBgInstance) {
      updateDynamicBgColors(newPrimaryColor)
    }
  })

  // 监听主题模式变化
  watch(() => appStore.themeMode, (newVal) => {
    if (loginStore.isDynamicBackground && newVal !== 'dark') {
      setTimeout(() => {
        initDynamicBackground()
      }, 4)
    }
  })

  // 初始化
  onMounted(() => {
    initDynamicBackground()
    preloadBackgroundImages()
  })

  // 清理
  onUnmounted(() => {
    destroyDynamicBackground()
  })

  return {
    handleDynamicBgChange,
    handleStaticBgChange,
    handleVisualQualityChange,
    handleFormPositionChange
  }
}
