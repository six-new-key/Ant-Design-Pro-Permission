/**
 * 主题模式枚举
 */
export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

/**
 * 设置主题模式
 * @param {string} mode - 主题模式 ('light' | 'dark')
 */
export function setThemeMode(mode) {
  const root = document.documentElement
  
  if (mode === THEME_MODE.AUTO) {
    const systemMode = getSystemThemeMode()
    root.setAttribute('theme-mode', systemMode)
  } else {
    root.setAttribute('theme-mode', mode)
  }
}

/**
 * 主题切换动画
 * @param {Event} e - 鼠标点击事件
 * @param {Function} themeChangeCallback - 主题切换回调函数
 * @param {Object} options - 动画选项
 * @param {number} options.duration - 动画持续时间，默认400ms
 */
export function themeChangeWithAnimation(e, themeChangeCallback, options = {}) {
  const { duration = 500 } = options

  // 检查浏览器是否支持 View Transition API
  if (!document.startViewTransition) {
    // 如果不支持，直接执行主题切换
    themeChangeCallback()
    return
  }

  // 获取到 transition API 实例
  const transition = document.startViewTransition(() => {
    themeChangeCallback()
  })

  // 在 transition.ready 的 Promise 完成后，执行自定义动画
  transition.ready.then(() => {
    // 由于我们要从鼠标点击的位置开始做动画，所以我们需要先获取到鼠标的位置
    const { clientX, clientY } = e

    // 计算半径，以鼠标点击的位置为圆心，到四个角的距离中最大的那个作为半径
    const radius = Math.hypot(
      Math.max(clientX, innerWidth - clientX),
      Math.max(clientY, innerHeight - clientY)
    )
    const clipPath = [
      `circle(0% at ${clientX}px ${clientY}px)`,
      `circle(${radius}px at ${clientX}px ${clientY}px)`
    ]
    const isDark = document.documentElement.getAttribute('theme-mode') === 'dark'
    
    // 自定义动画
    document.documentElement.animate(
      {
        // 如果要切换到暗色主题，我们在过渡的时候从半径 100% 的圆开始，到 0% 的圆结束
        clipPath: isDark ? clipPath.reverse() : clipPath
      },
      {
        duration,
        fill: 'both',
        // 如果要切换到暗色主题，我们应该裁剪 view-transition-old(root) 的内容
        pseudoElement: isDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)'
      }
    )
  })
}

/**
 * 应用主题配置
 * @param {Object} theme - 主题配置
 * @param {string} theme.mode - 主题模式 ('light' | 'dark')
 */
export function applyTheme(theme) {
  setThemeMode(theme.mode)
}

/**
 * 获取系统主题模式
 * @returns {string} 'light' | 'dark'
 */
export function getSystemThemeMode() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/**
 * 监听系统主题变化
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听函数
 */
export function watchSystemThemeChange(callback) {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }

  return () => { }
}

/**
 * 从本地存储获取主题配置
 * @returns {Object} 主题配置
 */
export function getThemeFromStorage() {
  try {
    const stored = localStorage.getItem('theme-config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('读取主题配置失败:', error)
  }

  return {
    mode: THEME_MODE.AUTO
  }
}

/**
 * 保存主题配置到本地存储
 * @param {Object} config - 主题配置
 */
export function saveThemeToStorage(config) {
  try {
    localStorage.setItem('theme-config', JSON.stringify(config))
  } catch (error) {
    console.error('保存主题配置失败:', error)
  }
}

/**
 * 初始化主题系统
 */
export function initTheme() {
  const config = getThemeFromStorage()
  let actualMode = config.mode

  // 如果是自动模式，获取系统主题
  if (config.mode === THEME_MODE.AUTO) {
    actualMode = getSystemThemeMode()

    // 监听系统主题变化
    watchSystemThemeChange((systemMode) => {
      if (getThemeFromStorage().mode === THEME_MODE.AUTO) {
        applyTheme({
          mode: systemMode
        })
      }
    })
  }

  // 应用主题
  applyTheme({
    mode: actualMode
  })

  return config
}