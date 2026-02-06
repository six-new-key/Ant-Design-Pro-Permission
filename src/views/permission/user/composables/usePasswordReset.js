import { ref, reactive } from 'vue'
import { Message } from '@/utils'
import { resetUserPassword } from '@/api/user'

/**
 * 密码重置管理
 */
export function usePasswordReset() {
  const passwordDialogVisible = ref(false)
  const passwordSubmitLoading = ref(false)
  const currentUser = ref({})
  const passwordFormRef = ref()

  // 密码表单
  const passwordForm = reactive({
    userName: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 密码表单验证规则
  const passwordFormRules = {
    newPassword: [
      { required: true, message: '新密码不能为空', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '确认密码不能为空', trigger: 'blur' },
      {
        validator: async (_rule, value) => {
          if (value !== passwordForm.newPassword) {
            return Promise.reject('两次输入的密码不一致')
          }
          return Promise.resolve()
        },
        trigger: 'blur'
      }
    ]
  }

  /**
   * 打开密码重置弹窗
   */
  const handleResetPassword = (record) => {
    currentUser.value = record
    passwordForm.userName = record.userName
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordDialogVisible.value = true
  }

  /**
   * 提交密码重置
   */
  const handlePasswordSubmit = () => {
    passwordFormRef.value.validate().then(async () => {
      try {
        passwordSubmitLoading.value = true
        const response = await resetUserPassword(currentUser.value.id, passwordForm.newPassword)

        if (response.code === 200) {
          Message.success('密码重置成功')
          passwordDialogVisible.value = false
        }
      } catch (error) {
        // 错误已由axios拦截器处理
      } finally {
        passwordSubmitLoading.value = false
      }
    }).catch(() => {
      // validation failed
    })
  }

  return {
    passwordDialogVisible,
    passwordSubmitLoading,
    currentUser,
    passwordFormRef,
    passwordForm,
    passwordFormRules,
    handleResetPassword,
    handlePasswordSubmit
  }
}
