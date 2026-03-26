import { ref } from 'vue'
import router from '@/router'
import { useUserStore } from '@/stores'
import { HOME_PATH } from '@/constants/routes'
import { loginByVerifyCode } from '@/api/auth'
import { AuthUtils } from '@/utils'

/**
 * 登录认证管理
 */
export function useLoginAuth() {
  const userStore = useUserStore()
  const loading = ref(false)

  /**
   * 执行密码登录
   */
  const doLogin = async (formData, validateForm, showCaptcha, saveRememberedUsername) => {
    // 1. 先校验表单
    try {
      await validateForm()
    } catch (error) {
      return
    }

    // 2. 如果没有验证码，显示验证码弹窗
    if (!formData.captchaVerification) {
      showCaptcha()
      return
    }

    // 3. 有验证码，直接提交登录
    await doLoginSubmit(formData, saveRememberedUsername)
  }

  /**
   * 执行验证码登录
   */
  const doVerifyCodeLogin = async (formData, validateForm) => {
    // 1. 先校验表单
    try {
      await validateForm()
    } catch (error) {
      return
    }

    // 2. 提交验证码登录
    loading.value = true
    try {
      const res = await loginByVerifyCode({
        phone: formData.phone,
        code: formData.code
      })
      
      if (res.code === 200) {
        // 存储 Token
        AuthUtils.setTokens(res.data)
        // 跳转首页
        router.push(HOME_PATH)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 提交密码登录
   */
  const doLoginSubmit = async (formData, saveRememberedUsername) => {
    loading.value = true
    try {
      const loginSuccess = await userStore.handleLogin(formData)
      if (loginSuccess) {
        // 登录成功后保存记住的账号
        if (saveRememberedUsername) {
          saveRememberedUsername()
        }
        router.push(HOME_PATH)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    doLogin,
    doVerifyCodeLogin,
    doLoginSubmit
  }
}
