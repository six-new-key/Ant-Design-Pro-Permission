<template>
  <!-- 权限分配对话框 -->
  <t-dialog v-model:visible="visible" placement="top" :top="isHalfScreen ? 30 : '10%'" header="分配权限"
    :width="isHalfScreen ? '68%' : '46%'" @close="handleCancel">
    <div class="permission-dialog">
      <!-- 角色信息 -->
      <div class="permission-header">
        <div class="role-info">
          正在为角色 <strong>{{ currentRole.name }}</strong> 分配权限
        </div>
        <div class="permission-actions">
          <t-tooltip :content="isExpandAll ? '收起全部' : '展开全部'">
            <t-button size="small" theme="default" @click="handleExpandAll">
              <t-icon :name="isExpandAll ? 'unfold-less' : 'unfold-more'" />
            </t-button>
          </t-tooltip>

          <t-tooltip :content="isCheckedAll ? '取消全选' : '全选'">
            <t-button size="small" theme="default" @click="handleCheckAll">
              <t-icon :name="isCheckedAll ? 'close-circle' : 'check-circle'" />
            </t-button>
          </t-tooltip>

          <t-tooltip :content="isHalfScreen ? '退出半屏' : '半屏'">
            <t-button size="small" theme="default" @click="handleHalfScreen">
              <t-icon :name="isHalfScreen ? 'fullscreen-exit' : 'fullscreen'" />
            </t-button>
          </t-tooltip>
        </div>
      </div>

      <!-- 权限树 -->
      <div class="permission-content">
        <div v-if="permissionLoading" class="permission-loading">
          <t-loading size="medium" />
          <span style="margin-left: 8px;">正在加载权限数据...</span>
        </div>
        <t-tree v-else :data="props.allPermissions"
          :keys="{ value: 'id', label: 'title', children: 'children' }" checkable hover activable valueMode="all"
          :expand-all="isExpandAll" v-model:value="selectedPermissionIds" v-model:actived="selectedPermissionIds"
          :height="isHalfScreen ? 450 : 220" expand-on-click-node expandParent line :scroll="{
            rowHeight: 34,
            bufferSize: 10,
            threshold: 10,
            type: 'virtual',
          }" @change="handlePermissionCheck" :empty="'暂无权限数据'" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <t-button theme="default" @click="handleCancel">取消</t-button>
        <t-button :loading="permissionLoading" @click="handleSave">保存</t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message } from '@/utils/ui'
import { saveRolePermission } from '@/api/role'

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
const isExpandAll = ref(true);
const isCheckedAll = ref(false);
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
    console.log(props.rolePermissions)
    // 使用父组件传递的角色权限数据
    selectedPermissionIds.value = [...(props.rolePermissions || [])]
  }
})

// 监听角色权限数据变化
watch(() => props.rolePermissions, (newVal) => {
  if (props.visible && newVal) {
    selectedPermissionIds.value = [...newVal]
  }
}, { deep: true })

/**
 * 处理权限选择变化
 */
const handlePermissionCheck = (checked, { node }) => {
  selectedPermissionIds.value = checked
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
 * 展开或收缩全部节点
 */
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
}

/**
 * 全选权限
 */
const handleCheckAll = () => {
  isCheckedAll.value = !isCheckedAll.value
  if (isCheckedAll.value) {
    selectedPermissionIds.value = filterAllPermissions(props.allPermissions);
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
 * 实现权限id过滤方法
 */
const filterAllPermissions = (permissions) => {
  const ids = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(permissions)
  return ids
}

/**
 * 保存权限分配
 */
const handleSave = async () => {
  permissionLoading.value = true

  // 在保存时才收集包含祖先节点的完整ID列表
  const completeIds = getIdsWithAncestors(selectedPermissionIds.value, props.allPermissions)
  
  // 调用保存权限的API，传入完整的ID列表
  await saveRolePermission(props.roleInfo.id, completeIds)
  console.log(completeIds)

  Message.success('权限分配成功')
  emit('save-success')
  handleCancel()

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
    background: var(--td-bg-color-container-hover);
    border-radius: 6px;

    .role-info {
      font-weight: 500;
      color: var(--td-text-color-primary);
    }

    .role-info strong {
      font-size: 14px;
      font-weight: 600;
      color: var(--td-brand-color);
    }

    .permission-actions {
      display: flex;
      gap: 8px;
    }
  }

  .permission-content {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid var(--td-component-border);
    border-radius: 6px;
    padding: 12px;

    .permission-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: var(--td-text-color-placeholder);
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--td-component-border);
  }
}
</style>