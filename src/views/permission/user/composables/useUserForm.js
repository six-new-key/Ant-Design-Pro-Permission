import { ref, reactive, computed } from 'vue'
import { Message } from '@/utils'
import { AuthUtils } from '@/utils/auth'
import { addUser, updateUser, echoUserById } from '@/api/user'

/**
 * 用户表单管理（新增/编辑）
 */
export function useUserForm(fetchUserList) {
  const userDialogVisible = ref(false)
  const submitLoading = ref(false)
  const isEdit = ref(false)
  const userFormRef = ref()

  // 表单数据
  const userForm = reactive({
    id: null,
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 0,
    avatar: ''
  })

  // 头像上传配置
  const uploadUrl = ref(import.meta.env.VITE_API_BASE_URL + '/file/upload/avatar')
  
  // 动态获取 Token 的 computed 属性（响应式，Token 更新时自动重新计算）
  const uploadHeaders = computed(() => {
    const token = AuthUtils.getAccessToken()
    return {
      Authorization: token || ''
    }
  })

  // 表单验证规则
  const userFormRules = {
    userName: [
      { required: true, message: '用户名不能为空', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '手机号不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '确认密码不能为空', trigger: 'blur' },
      {
        validator: async (_rule, value) => {
          if (value !== userForm.password) {
            return Promise.reject('两次输入的密码不一致')
          }
          return Promise.resolve()
        },
        trigger: 'blur'
      }
    ]
  }

  /**
   * 头像上传前校验
   */
  const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      Message.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      Message.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }

  /**
   * 头像上传回调
   */
  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return
    }
    if (info.file.status === 'done') {
      if (info.file.response && info.file.response.code === 200) {
        userForm.avatar = info.file.response.data
        Message.success('头像上传成功')
      } else {
        Message.error(info.file.response?.message || '头像上传失败')
      }
    } else if (info.file.status === 'error') {
      Message.error('头像上传失败，请重试')
    }
  }

  /**
   * 重置表单
   */
  const resetUserForm = () => {
    Object.assign(userForm, {
      id: null,
      userName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: 0,
      avatar: ''
    })
  }

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    isEdit.value = false
    resetUserForm()
    userDialogVisible.value = true
  }

  /**
   * 打开编辑弹窗
   */
  const handleEdit = async (record) => {
    isEdit.value = true
    const response = await echoUserById(record.id)
    if (response.code === 200) {
      Object.assign(userForm, response.data)
      userDialogVisible.value = true
    }
  }

  /**
   * 提交表单
   */
  const handleUserSubmit = () => {
    userFormRef.value.validate().then(async () => {
      submitLoading.value = true
      try {
        const apiMethod = isEdit.value ? updateUser : addUser
        const response = await apiMethod(userForm)

        if (response.code === 200) {
          Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
          userDialogVisible.value = false
          fetchUserList()
        }
      } catch (error) {
        // 接口调用失败，错误已在 axios 拦截器中处理
        console.error('用户操作失败:', error)
      } finally {
        submitLoading.value = false
      }
    }).catch(() => {
      // 表单验证失败
      submitLoading.value = false
    })
  }

  return {
    userDialogVisible,
    submitLoading,
    isEdit,
    userFormRef,
    userForm,
    userFormRules,
    uploadUrl,
    uploadHeaders,
    beforeAvatarUpload,
    handleAvatarChange,
    handleAdd,
    handleEdit,
    handleUserSubmit
  }
}
