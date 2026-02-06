<template>
  <a-modal v-model:open="visible" title="数据权限" :width="isHalfScreen ? '68%' : '46%'" @cancel="handleCancel"
    @ok="handleSave" centered :confirmLoading="permissionLoading" :okButtonProps="{ disabled: roleInfo.status === 0 || roleInfo.code === 'admin' }" wrapClassName="permission-dialog-modal">
    <div class="permission-dialog" :style="cssVars">
      <!-- 角色信息 -->
      <div class="permission-header">
        <div class="role-info">
          正在为角色 <strong>{{ currentRole.name }}</strong> 分配权限
          <a-tag v-if="currentRole.status === 0" color="error" style="margin-left: 8px;">已禁用</a-tag>
          <a-tag v-if="currentRole.code === 'admin'" color="blue" style="margin-left: 8px;">超级管理员</a-tag>
        </div>
        <div class="permission-actions">
          <a-tooltip :title="isExpandAll ? '收起全部' : '展开全部'">
            <a-button size="small" type="text" @click="handleExpandAll">
              <template #icon>
                <component :is="isExpandAll ? 'MenuFoldOutlined' : 'MenuUnfoldOutlined'" />
              </template>
            </a-button>
          </a-tooltip>

          <a-tooltip :title="isCheckedAll ? '取消全选' : '全选'">
            <a-button size="small" type="text" @click="handleCheckAll">
              <template #icon>
                <component :is="isCheckedAll ? 'CloseCircleOutlined' : 'CheckCircleOutlined'" />
              </template>
            </a-button>
          </a-tooltip>

          <a-tooltip :title="isHalfScreen ? '退出半屏' : '半屏'">
            <a-button size="small" type="text" @click="handleHalfScreen">
              <template #icon>
                <component :is="isHalfScreen ? 'CompressOutlined' : 'ExpandOutlined'" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 权限树 -->
      <div class="permission-content">
        <div v-if="permissionLoading" class="permission-loading">
          <a-spin size="large" />
          <span style="margin-left: 8px;">正在加载权限数据...</span>
        </div>
        <a-tree v-else :tree-data="props.allPermissions"
          :field-names="{ title: 'title', key: 'id', children: 'children' }" checkable
          v-model:checkedKeys="selectedPermissionIds" v-model:expandedKeys="expandedKeys"
          :height="isHalfScreen ? 450 : 280" virtual @check="handlePermissionCheck">
          <template #title="{ title }">
            {{ title }}
          </template>
        </a-tree>
        <div v-if="!permissionLoading && (!props.allPermissions || props.allPermissions.length === 0)"
          class="empty-state">
          暂无权限数据
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { theme } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined
} from '@ant-design/icons-vue'
import { Message } from '@/utils'
import { saveRolePermission } from '@/api/role'

const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder,
    '--color-text-secondary': t.colorTextSecondary,
    '--color-text-placeholder': t.colorTextPlaceholder,
    '--bg-color-container-hover': t.colorFillTertiary, // Approximating TDesign's hover container
    '--component-border': t.colorBorderSecondary
  }
})

// 组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roleInfo: {
    type: Object,
    default: () => ({})
  },
  allPermissions: {
    type: Array,
    default: () => []
  },
  rolePermissions: {
    type: Array,
    default: () => []
  }
})

// 组件事件
const emit = defineEmits(['update:visible', 'save-success'])

// 响应式数据
const permissionLoading = ref(false)
const selectedPermissionIds = ref([])
const expandedKeys = ref([])
const isExpandAll = ref(true)
const isCheckedAll = ref(false)
const isHalfScreen = ref(false)

// 计算属性
const currentRole = computed(() => props.roleInfo)
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 监听对话框显示状态和角色权限数据变化
watch(() => props.visible, (newVal) => {
  if (newVal && props.roleInfo.id) {
    // 使用父组件传递的角色权限数据
    selectedPermissionIds.value = [...(props.rolePermissions || [])]
    if (isExpandAll.value) {
      expandAllNodes()
    }
  }
})

// 监听角色权限数据变化
watch(() => props.rolePermissions, (newVal) => {
  if (props.visible && newVal) {
    selectedPermissionIds.value = [...newVal]
  }
}, { deep: true })

// 监听 allPermissions 变化，初始化展开状态
watch(() => props.allPermissions, (newVal) => {
  if (newVal && newVal.length > 0 && isExpandAll.value) {
    expandAllNodes()
  }
})

/**
 * 处理权限选择变化
 */
const handlePermissionCheck = (checkedKeys, info) => {
  // Ant Design Vue checkedKeys reflects the checked state
  selectedPermissionIds.value = checkedKeys
}

/**
 * 获取包含祖先节点的完整ID列表
 * @param {Array} checkedIds - 当前选中的ID列表
 * @param {Array} allPermissions - 所有权限树数据
 * @returns {Array} 包含祖先节点的完整ID列表
 */
const getIdsWithAncestors = (checkedIds, allPermissions) => {
  const result = new Set(checkedIds)
  const checkedSet = new Set(checkedIds)

  const traverse = (nodes, ancestors = []) => {
    nodes.forEach(node => {
      if (hasCheckedDescendant(node, checkedSet)) {
        ancestors.forEach(ancestorId => result.add(ancestorId))
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children, [...ancestors, node.id])
      }
    })
  }

  const hasCheckedDescendant = (node, checkedSet) => {
    if (checkedSet.has(node.id)) return true
    if (node.children && node.children.length > 0) {
      return node.children.some(child => hasCheckedDescendant(child, checkedSet))
    }
    return false
  }

  traverse(allPermissions)
  return Array.from(result)
}

/**
 * 获取所有节点ID
 */
const getAllNodeIds = (nodes) => {
  const ids = []
  const traverse = (list) => {
    list.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return ids
}

/**
 * 展开所有节点
 */
const expandAllNodes = () => {
  expandedKeys.value = getAllNodeIds(props.allPermissions)
}

/**
 * 展开或收缩全部节点
 */
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
  if (isExpandAll.value) {
    expandAllNodes()
  } else {
    expandedKeys.value = []
  }
}

/**
 * 全选权限
 */
const handleCheckAll = () => {
  isCheckedAll.value = !isCheckedAll.value
  if (isCheckedAll.value) {
    selectedPermissionIds.value = getAllNodeIds(props.allPermissions)
  } else {
    selectedPermissionIds.value = []
  }
}

/**
 * 半屏显示
 */
const handleHalfScreen = () => {
  isHalfScreen.value = !isHalfScreen.value
}

/**
 * 保存权限分配
 */
const handleSave = async () => {
  permissionLoading.value = true

  // 在保存时才收集包含祖先节点的完整ID列表
  const completeIds = getIdsWithAncestors(selectedPermissionIds.value, props.allPermissions)

  // 调用保存权限的API，传入完整的ID列表
  const response = await saveRolePermission(props.roleInfo.id, completeIds)
  if (response.code === 200) {
    Message.success('权限分配成功')
    emit('save-success')
    handleCancel()
  }

  permissionLoading.value = false
}

/**
 * 取消权限分配
 */
const handleCancel = () => {
  visible.value = false
  // 重置选中的权限数据
  selectedPermissionIds.value = []
  isHalfScreen.value = false
  isExpandAll.value = true
  isCheckedAll.value = false
  // Reset expanded keys if needed, or keep them
}
</script>

<style scoped lang="scss">
/* 权限分配对话框样式 */
.permission-dialog {
  .permission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: var(--bg-color-container-hover);
    border-radius: 6px;

    .role-info {
      font-weight: 500;
      color: var(--color-text);
    }

    .role-info strong {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-primary);
    }

    .permission-actions {
      display: flex;
      gap: 10px;
    }
  }

  .permission-content {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid var(--component-border);
    border-radius: 6px;
    padding: 12px;
    min-height: 280px;
    /* Ensure loading state has height */

    .permission-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--color-text-placeholder);
    }

    .empty-state {
      text-align: center;
      padding: 20px;
      color: var(--color-text-placeholder);
    }
  }

  /* Scrollbar styling for permission content */
  .permission-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .permission-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .permission-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  .permission-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
