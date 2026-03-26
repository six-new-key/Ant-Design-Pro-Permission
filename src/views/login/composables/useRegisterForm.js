import { ref, reactive, computed } from 'vue'
import { register } from '@/api/auth'
import { message } from '@/utils'

/**
 * 注册表单管理
 * @param {Object} options - 配置选项
 * @param {Ref} options.codeLength - 验证码长度（响应式）
 */
export function useRegisterForm(options = {}) {
  const { codeLength } = options
  
  const formRef = ref()
  const loading = ref(false)

  // 表单数据
  const formData = reactive({
    userName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    code: '',
    email: '',
    gender: 0
  })

  // 表单验证规则
  const rules = computed(() => {
    const length = codeLength?.value || 6
    const codePattern = new RegExp(`^\\d{${length}}$`)
    
    return {
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (_rule, value) => {
            if (value !== formData.password) {
              return Promise.reject('两次输入的密码不一致')
            }
            return Promise.resolve()
          },
          trigger: 'blur'
        }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: codePattern, message: `验证码格式不正确，请输入${length}位数字`, trigger: 'blur' }
      ],
      // email: [
      //   { required: true, message: '请输入邮箱', trigger: 'blur' },
      //   { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
      // ]
    }
  })

  /**
   * 重置表单
   */
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      userName: '',
      password: '',
      confirmPassword: '',
      phone: '',
      code: '',
      email: '',
      gender: 0
    })
  }

  /**
   * 验证表单
   */
  const validateForm = async () => {
    return await formRef.value.validate()
  }

  /**
   * 提交注册
   */
  const submitRegister = async () => {
    try {
      loading.value = true
      
      // 验证表单
      await validateForm()
      
      // 调用注册接口
      const res = await register({
        userName: formData.userName,
        password: formData.password,
        phone: formData.phone,
        code: formData.code,
        email: formData.email,
        gender: formData.gender
      })

      if (res.code === 200) {
        message.success('注册成功！请登录')
        return {
          success: true,
          userName: formData.userName
        }
      } else {
        return { success: false }
      }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    formRef,
    formData,
    rules,
    loading,
    resetForm,
    validateForm,
    submitRegister
  }
}
