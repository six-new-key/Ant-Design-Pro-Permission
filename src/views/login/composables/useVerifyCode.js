import { ref, onMounted } from 'vue'
import { sendSms } from '@/api/auth'
import { getSystemConfigValue } from '@/api/systemConfig'
import { message } from '@/utils'

/**
 * 验证码管理
 * @param {Object} options - 配置选项
 * @param {Function} options.showCaptcha - 显示图形验证码的方法
 */
export function useVerifyCode(options = {}) {
  const { showCaptcha } = options
  
  const countdown = ref(0)
  const sending = ref(false)
  const codeLength = ref(6) // 验证码长度，默认6位
  const countdownTime = ref(60) // 倒计时时间（秒），默认60秒
  const pendingPhone = ref('') // 待发送验证码的手机号
  const captchaVerified = ref(false) // 图形验证码是否已验证

  /**
   * 加载短信验证码配置
   */
  const loadSmsConfig = async () => {
    try {
      // 获取验证码长度配置
      const lengthResponse = await getSystemConfigValue('sms_code_length')
      if (lengthResponse.code === 200 && lengthResponse.data) {
        codeLength.value = parseInt(lengthResponse.data) || 6
      }

      // 获取验证码过期时间配置（分钟）
      const expireResponse = await getSystemConfigValue('sms_code_expire_minutes')
      if (expireResponse.code === 200 && expireResponse.data) {
        // 将分钟转换为秒作为倒计时时间
        const expireMinutes = parseInt(expireResponse.data) || 5
        countdownTime.value = expireMinutes * 60
      }
    } catch (error) {
      console.error('加载短信验证码配置失败:', error)
      // 使用默认值
      codeLength.value = 6
      countdownTime.value = 60
    }
  }

  /**
   * 实际发送验证码（图形验证码通过后调用）
   */
  const doSendVerifyCode = async (phone) => {
    try {
      sending.value = true
      
      // 调用发送验证码接口
      const res = await sendSms({
        phone: phone,
        templateCode: '100001' // 登录注册验证码模板
      })

      if (res.code === 200) {
        message.success('验证码已发送')
        
        // 开始倒计时（使用配置的倒计时时间）
        countdown.value = countdownTime.value
        const timer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(timer)
          }
        }, 1000)
        
        // 重置状态
        captchaVerified.value = false
        pendingPhone.value = ''
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      // 重置状态，允许重新尝试
      captchaVerified.value = false
      pendingPhone.value = ''
    } finally {
      sending.value = false
    }
  }

  /**
   * 请求发送验证码（先弹出图形验证码）
   */
  const requestSendVerifyCode = (phone) => {
    // 校验手机号
    if (!phone) {
      message.warning('请输入手机号')
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('手机号格式不正确')
      return
    }

    // 防止重复点击
    if (countdown.value > 0 || sending.value) {
      return
    }

    // 保存手机号，等待图形验证码验证通过
    pendingPhone.value = phone
    
    // 显示图形验证码
    if (showCaptcha) {
      showCaptcha()
    } else {
      console.error('showCaptcha 方法未提供')
      message.error('验证码功能初始化失败')
    }
  }

  /**
   * 图形验证码验证成功回调
   */
  const onCaptchaSuccess = () => {
    captchaVerified.value = true
    
    // 如果有待发送的手机号，立即发送
    if (pendingPhone.value) {
      doSendVerifyCode(pendingPhone.value)
    }
  }

  /**
   * 获取按钮文本
   */
  const getButtonText = () => {
    if (countdown.value > 0) {
      return `${countdown.value}秒后重试`
    }
    return '获取验证码'
  }

  /**
   * 按钮是否禁用
   * @param {string} phone - 手机号，传入时额外校验格式
   */
  const isButtonDisabled = (phone) => {
    if (phone !== undefined) {
      const phoneValid = /^1[3-9]\d{9}$/.test(phone)
      return !phoneValid || countdown.value > 0 || sending.value
    }
    return countdown.value > 0 || sending.value
  }

  // 初始化
  onMounted(() => {
    loadSmsConfig()
  })

  return {
    countdown,
    sending,
    codeLength,
    countdownTime,
    pendingPhone,
    captchaVerified,
    requestSendVerifyCode,
    onCaptchaSuccess,
    getButtonText,
    isButtonDisabled
  }
}
