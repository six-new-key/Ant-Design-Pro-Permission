import { computed } from 'vue'
import { theme } from 'ant-design-vue'
import { useLoginStore, useAppStore } from '@/stores'

/**
 * 登录页面样式计算
 */
export function useLoginStyles() {
  const { useToken } = theme
  const { token } = useToken()
  
  const loginStore = useLoginStore()
  const appStore = useAppStore()

  /**
   * 登录容器样式
   */
  const loginContainerStyle = computed(() => ({
    width: loginStore.formPosition === 'left' ? '600px' : '520px',
    padding: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? '20px 40px' 
      : loginStore.formPosition === 'left' ? '80px' : '80px 40px',
    height: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? 'auto' 
      : '100vh',
    borderRadius: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? token.value.borderRadius + 30 + 'px' 
      : '0px',
    marginBottomItem: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? '18px' 
      : '24px',
    background: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? (loginStore.selectedVisualQuality === 'glass' ? 'transparent' : token.value.colorBgContainer) 
      : token.value.colorBgContainer,
    boxShadow: loginStore.formPosition === 'center' || loginStore.backgroundMode === 'dynamic' 
      ? (loginStore.selectedVisualQuality === 'glass' ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none') 
      : 'none'
  }))

  /**
   * 控制面板样式
   */
  const controlPanelStyle = computed(() => ({
    background: appStore.themeMode === 'dark' 
      ? token.value.colorFillTertiary 
      : loginStore.backgroundMode === 'dynamic' 
        ? '#fff' 
        : loginStore.formPosition === 'right' 
          ? token.value.colorFillTertiary 
          : '#fff'
  }))

  return {
    token,
    loginContainerStyle,
    controlPanelStyle
  }
}
