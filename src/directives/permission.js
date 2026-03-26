/**
 * 权限指令
 * 
 * 用法：
 * 1. 单个权限：v-permission="'permission:menu:remove'"
 * 2. 多个权限（OR）：v-permission="['permission:menu:edit', 'permission:menu:remove']"
 * 3. 多个权限（AND）：v-permission.all="['permission:menu:edit', 'permission:menu:remove']"
 * 4. 禁用而非移除：v-permission.disable="'permission:menu:edit'"
 * 
 * 角色指令：
 * 1. 单个角色：v-role="'admin'"
 * 2. 多个角色（OR）：v-role="['admin', 'user']"
 * 3. 禁用而非移除：v-role.disable="'admin'"
 */

import { useUserStore } from '@/stores'
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } from '@/utils/permission'

/**
 * 权限指令
 */
export const permission = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    
    // 获取用户 Store
    const userStore = useUserStore()
    const permissions = userStore.permissions || []
    
    // 未传入权限值，移除元素
    if (!value) {
      console.warn('[v-permission] 未传入权限值')
      el.parentNode?.removeChild(el)
      return
    }
    
    let hasPermissionFlag = false
    
    // 判断权限
    if (Array.isArray(value)) {
      // 数组：支持 OR 和 AND 逻辑
      if (modifiers.all) {
        // AND 逻辑：必须拥有所有权限
        hasPermissionFlag = hasAllPermissions(value, permissions)
      } else {
        // OR 逻辑（默认）：拥有任意一个权限即可
        hasPermissionFlag = hasAnyPermission(value, permissions)
      }
    } else if (typeof value === 'string') {
      // 字符串：单个权限
      hasPermissionFlag = hasPermission(value, permissions)
    } else {
      console.warn('[v-permission] 权限值类型错误，应为 string 或 Array<string>')
    }
    
    // 无权限处理
    if (!hasPermissionFlag) {
      if (modifiers.disable) {
        // 禁用元素
        el.disabled = true
        el.style.cursor = 'not-allowed'
        el.style.opacity = '0.7'
        // 阻止所有事件
        el.addEventListener('click', e => e.stopImmediatePropagation(), true)
      } else {
        // 移除元素（默认）
        el.parentNode?.removeChild(el)
      }
    }
  }
}

/**
 * 角色指令
 */
export const role = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    
    // 获取用户 Store
    const userStore = useUserStore()
    const roles = userStore.roles || []
    
    // 未传入角色值，移除元素
    if (!value) {
      console.warn('[v-role] 未传入角色值')
      el.parentNode?.removeChild(el)
      return
    }
    
    let hasRoleFlag = false
    
    // 判断角色
    if (Array.isArray(value)) {
      // 数组：OR 逻辑（拥有任意一个角色即可）
      hasRoleFlag = hasAnyRole(value, roles)
    } else if (typeof value === 'string') {
      // 字符串：单个角色
      hasRoleFlag = hasRole(value, roles)
    } else {
      console.warn('[v-role] 角色值类型错误，应为 string 或 Array<string>')
    }
    
    // 无角色处理
    if (!hasRoleFlag) {
      if (modifiers.disable) {
        // 禁用元素
        el.disabled = true
        el.style.cursor = 'not-allowed'
        el.style.opacity = '0.7'
        // 阻止所有事件
        el.addEventListener('click', e => e.stopImmediatePropagation(), true)
      } else {
        // 移除元素（默认）
        el.parentNode?.removeChild(el)
      }
    }
  }
}
