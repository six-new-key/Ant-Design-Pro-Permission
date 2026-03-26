import { ref, reactive, computed, onMounted } from 'vue'

/**
 * 登录表单管理
 * @param {Object} options - 配置选项
 * @param {Ref} options.codeLength - 验证码长度（响应式）
 */
export function useLoginForm(options = {}) {
  const formRef = ref()
  const { codeLength } = options
  
  // 登录类型：password-密码登录，verifyCode-验证码登录
  const loginType = ref('password')

  // 表单数据
  const formData = reactive({
    userName: '',
    password: '',
    phone: '',
    code: '',
    captcha: false,
    remember: false,
    captchaVerification: ''
  })

  // 页面加载时读取记住的账号
  onMounted(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername')
    if (rememberedUsername) {
      formData.userName = rememberedUsername
      formData.remember = true
    }
  })

  // 表单验证规则（根据登录类型动态变化）
  const rules = computed(() => {
    if (loginType.value === 'password') {
      // 密码登录规则
      return {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        captcha: [
          {
            validator: (_rule, value) => {
              if (!value) {
                return Promise.reject('请完成滑块验证')
              }
              return Promise.resolve()
            },
            trigger: ['change', 'blur']
          }
        ]
      }
    } else {
      // 验证码登录规则
      // 动态生成验证码长度的正则表达式
      const length = codeLength?.value || 6
      const codePattern = new RegExp(`^\\d{${length}}$`)
      
      return {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: codePattern, message: `验证码格式不正确，请输入${length}位数字`, trigger: 'blur' }
        ]
      }
    }
  })

  /**
   * 切换登录类型
   */
  const switchLoginType = (type) => {
    loginType.value = type
    // 切换时清空表单验证状态
    formRef.value?.clearValidate()
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    formData.captchaVerification = ''
    formData.captcha = false
  }

  /**
   * 验证表单
   */
  const validateForm = async () => {
    return await formRef.value.validate()
  }

  /**
   * 保存或清除记住的账号
   */
  const saveRememberedUsername = () => {
    if (formData.remember) {
      localStorage.setItem('rememberedUsername', formData.userName)
    } else {
      localStorage.removeItem('rememberedUsername')
    }
  }

  return {
    formRef,
    formData,
    rules,
    loginType,
    switchLoginType,
    resetForm,
    validateForm,
    saveRememberedUsername
  }
}
