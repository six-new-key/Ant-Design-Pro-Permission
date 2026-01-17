import { ref } from 'vue'

/**
 * 右键菜单组合式函数
 * @returns {Object} 右键菜单相关的状态和方法
 */
export function useContextMenu() {
  // 右键菜单状态
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetPath: ''
  })

  /**
   * 显示右键菜单
   * @param {MouseEvent} event - 鼠标事件
   * @param {Object} target - 目标对象（如页面信息）
   * @param {number} menuWidth - 菜单宽度，默认160px
   */
  const showContextMenu = (event, target = {}, menuWidth = 160) => {
    event.preventDefault()
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // 计算菜单位置，处理边界情况
    let x = event.clientX
    let y = event.clientY
    
    // 右边界检测
    if (x + menuWidth > viewportWidth) {
      x = event.clientX - menuWidth
    }
    
    // 下边界检测（假设菜单高度约为200px）
    const menuHeight = 200
    if (y + menuHeight > viewportHeight) {
      y = event.clientY - menuHeight
    }
    
    contextMenu.value = {
      visible: true,
      x: Math.max(0, x), // 确保不超出左边界
      y: Math.max(0, y), // 确保不超出上边界
      targetPath: target.path || ''
    }
  }

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = () => {
    contextMenu.value.visible = false
  }

  return {
    contextMenu,
    showContextMenu,
    closeContextMenu
  }
}