import { ref, computed } from 'vue'
import { Message } from '@/utils'
import { queryUserRoles, saveUserRoles } from '@/api/user'
import { queryRoleList } from '@/api/role'

/**
 * 角色分配管理
 */
export function useRoleAssign() {
  const roleDialogVisible = ref(false)
  const roleSubmitLoading = ref(false)
  const currentUser = ref({})
  const roleList = ref([])
  const selectedRoles = ref([])

  // 可分配角色（排除已分配的）
  const availableRoles = computed(() => {
    return roleList.value.filter(role => !selectedRoles.value.includes(role))
  })

  /**
   * 加载角色列表
   */
  const fetchRoleList = async () => {
    const response = await queryRoleList()
    if (response.code === 200) {
      roleList.value = response.data || []
    }
  }

  /**
   * 打开角色分配弹窗
   */
  const handleAssignRole = async (record) => {
    currentUser.value = record
    const response = await queryUserRoles(record.id)
    if (response.code === 200) {
      selectedRoles.value = response.data || []
      roleDialogVisible.value = true
    }
  }

  /**
   * 添加角色
   */
  const addRole = (role) => {
    if (!selectedRoles.value.includes(role)) {
      selectedRoles.value.push(role)
    }
  }

  /**
   * 移除角色
   */
  const removeRole = (role) => {
    const index = selectedRoles.value.indexOf(role)
    if (index > -1) {
      selectedRoles.value.splice(index, 1)
    }
  }

  /**
   * 保存角色分配
   */
  const handleSaveRoles = async () => {
    roleSubmitLoading.value = true
    const response = await saveUserRoles(currentUser.value.id, selectedRoles.value)
    if (response.code === 200) {
      Message.success('角色分配成功')
      roleDialogVisible.value = false
    }
    roleSubmitLoading.value = false
  }

  return {
    roleDialogVisible,
    roleSubmitLoading,
    currentUser,
    roleList,
    selectedRoles,
    availableRoles,
    fetchRoleList,
    handleAssignRole,
    addRole,
    removeRole,
    handleSaveRoles
  }
}
