import { ref, onMounted } from 'vue'
import { getSystemConfigValue } from '@/api/systemConfig'

/**
 * 验证码管理
 */
export function useCaptcha() {
  const dragVerify = ref()
  const verifyRef = ref()
  const captchaType = ref('blockPuzzle')

  /**
   * 加载验证码类型配置
   */
  const loadCaptchaConfig = async () => {
    try {
      const response = await getSystemConfigValue('login_captcha_type')
      if (response.code === 200 && response.data) {
        captchaType.value = response.data || 'blockPuzzle'
      }
    } catch (error) {
      console.error('加载验证码配置失败:', error)
      captchaType.value = 'blockPuzzle'
    }
  }

  /**
   * 验证成功回调（只保存token，不自动提交）
   */
  const handleVerifySuccess = (params, formData) => {
    console.log('验证成功:', params)
    formData.captchaVerification = params.captchaVerification || params
  }

  /**
   * 处理滑块验证通过
   */
  const handleCaptchaPass = (formRef) => {
    formRef.value.clearValidate()
  }

  /**
   * 显示验证码弹窗
   */
  const showCaptcha = () => {
    if (verifyRef.value) {
      verifyRef.value.show()
    }
  }

  /**
   * 重置验证码
   */
  const resetCaptcha = () => {
    // 刷新AJ-Captcha验证码
    if (verifyRef.value) {
      verifyRef.value.refresh()
    }
    
    // 重置装饰性滑块
    if (dragVerify.value && dragVerify.value.reset) {
      dragVerify.value.reset()
    }
  }

  // 初始化
  onMounted(() => {
    loadCaptchaConfig()
  })

  return {
    dragVerify,
    verifyRef,
    captchaType,
    handleVerifySuccess,
    handleCaptchaPass,
    showCaptcha,
    resetCaptcha
  }
}
