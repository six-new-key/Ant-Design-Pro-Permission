import { computed } from 'vue'
import { useAppStore, useThemeStore } from '@/stores'
import { themeChangeWithAnimation } from '@/utils'

/**
 * 主题和语言控制管理
 */
export function useThemeControl() {
  const appStore = useAppStore()
  const themeStore = useThemeStore()

  /**
   * 颜色计算
   */
  const color = computed(() => {
    if (appStore.themeMode === 'dark') {
      return '#fff'
    } else {
      return '#555555'
    }
  })

  /**
   * 点图标颜色
   */
  const dotColor = computed(() => themeStore.primaryColorHex)

  /**
   * 图标大小
   */
  const iconSize = computed(() => {
    return themeStore.baseConfig.fontSize + 8 + 'px'
  })

  /**
   * 主题切换
   */
  const toggleThemeMode = (e) => {
    themeChangeWithAnimation(e, () => {
      appStore.setThemeMode(appStore.themeMode === 'dark' ? 'light' : 'dark')
    }, {
      themeMode: appStore.themeMode === 'dark' ? 'light' : 'dark'
    })
  }

  /**
   * 语言切换
   */
  const handleLanguageChange = ({ key }) => {
    appStore.setLanguage(key)
  }

  return {
    color,
    dotColor,
    iconSize,
    toggleThemeMode,
    handleLanguageChange
  }
}
