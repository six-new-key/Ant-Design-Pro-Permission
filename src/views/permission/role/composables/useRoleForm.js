import { ref, reactive } from 'vue'
import { Message } from '@/utils'
import { addRole, updateRole, echoRole } from '@/api/role'

/**
 * 角色表单管理（新增/编辑）
 */
export function useRoleForm(fetchRoleList) {
  const roleDialogVisible = ref(false)
  const submitLoading = ref(false)
  const isEdit = ref(false)
  const roleFormRef = ref()

  // 表单数据
  const roleForm = reactive({
    id: null,
    name: '',
    code: ''
  })

  // 表单验证规则
  const roleFormRules = {
    name: [
      { required: true, message: '角色名称不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度为2-20个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '角色编码不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '角色编码长度为2-20个字符', trigger: 'blur' }
    ]
  }

  /**
   * 重置表单
   */
  const resetRoleForm = () => {
    Object.assign(roleForm, {
      id: null,
      name: '',
      code: ''
    })
  }

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    isEdit.value = false
    resetRoleForm()
    roleDialogVisible.value = true
  }

  /**
   * 打开编辑弹窗
   */
  const handleEdit = async (record) => {
    isEdit.value = true
    const response = await echoRole(record.id)
    if (response.code === 200) {
      Object.assign(roleForm, response.data)
      roleDialogVisible.value = true
    }
  }

  /**
   * 提交表单
   */
  const handleRoleSubmit = () => {
    roleFormRef.value.validate().then(async () => {
      submitLoading.value = true
      const apiMethod = isEdit.value ? updateRole : addRole
      const response = await apiMethod(roleForm)

      if (response.code === 200) {
        Message.success(`${isEdit.value ? '更新' : '创建'}成功`)
        roleDialogVisible.value = false
        fetchRoleList()
      }
      submitLoading.value = false
    }).catch(() => {
      // validation failed
    })
  }

  return {
    roleDialogVisible,
    submitLoading,
    isEdit,
    roleFormRef,
    roleForm,
    roleFormRules,
    handleAdd,
    handleEdit,
    handleRoleSubmit
  }
}
