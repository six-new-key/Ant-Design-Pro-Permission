/**
 * 有关主题切换、主题切换动画工具函数
 */

// 预设主题色
export const COLOR_PRESETS = [
  { name: '科技蓝', color: '#1E40AF' },
  { name: '奢华金', color: '#B45309' },
  { name: '星巴克绿', color: '#00704A' },
  { name: '时尚粉', color: '#BE185D' },
  { name: '专业灰', color: '#374151' },
  { name: '理想银', color: '#9E9E9E' },
  { name: '阿里橙', color: '#FF6A00' },
  { name: '华润红', color: '#B71C1C' },
  { name: '支付宝蓝', color: '#1677FF' },
  { name: '耐克黑', color: '#212121' },
  { name: '宜家黄', color: '#FFDA00' },
  { name: 'OPPO绿', color: '#1AAD19' },
  { name: '阳光橙', color: '#F57C00' },
  { name: '华为红', color: '#FF0000' },
  { name: '零跑蓝', color: '#3F51B5' },
  { name: '水晶紫', color: '#A855F7' },
  { name: '月光银', color: '#94A3B8' },
  { name: '淡青柠', color: '#A3E635' },
  { name: '浅湖蓝', color: '#22D3EE' },
  { name: '浅杏色', color: '#EA580C' },
  { name: '柔和粉', color: '#EC4899' },
  { name: '柔蜜桃', color: '#E53E3E' },
  { name: '淡水仙', color: '#FACC15' },
  { name: '建军绿', color: '#6B8E23' },
]

/**
 * RGB转HEX
 * @param {string} rgb - RGB颜色值，格式如 'rgb(255, 255, 255)'
 * @returns {string} HEX颜色值，格式如 '#ffffff'
 */
export function rgbToHex(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgb
  
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * 主题切换动画
 * @param {Event} e - 鼠标点击事件
 * @param {Function} themeChangeCallback - 主题切换回调函数
 * @param {Object} options - 动画选项
 * @param {number} options.duration - 动画持续时间，默认400ms
 */
export function themeChangeWithAnimation(e, themeChangeCallback, options = {}) {
  const { duration = 500, themeMode } = options

  // 检查浏览器是否支持 View Transition API
  if (!document.startViewTransition) {
    // 如果不支持，直接执行主题切换
    themeChangeCallback()
    return
  }

  //主动设置一个html属性
  document.documentElement.setAttribute('theme-mode', themeMode)

  // 获取到 transition API 实例
  const transition = document.startViewTransition(() => {
    themeChangeCallback()
  })

  // 在 transition.ready 的 Promise 完成后，执行自定义动画
  transition.ready.then(() => {
    // 由于我们要从鼠标点击的位置开始做动画，所以我们需要先获取到鼠标的位置
    const { clientX, clientY } = e

    // 计算半径，以鼠标点击的位置为圆心，到四个角的距离中最大的那个作为半径
    const radius = Math.hypot(
      Math.max(clientX, innerWidth - clientX),
      Math.max(clientY, innerHeight - clientY)
    )
    const clipPath = [
      `circle(0% at ${clientX}px ${clientY}px)`,
      `circle(${radius}px at ${clientX}px ${clientY}px)`
    ]
    const isDark = document.documentElement.getAttribute('theme-mode') === 'dark'
    
    // 自定义动画
    document.documentElement.animate(
      {
        // 如果要切换到暗色主题，我们在过渡的时候从半径 100% 的圆开始，到 0% 的圆结束
        clipPath: isDark ? clipPath.reverse() : clipPath
      },
      {
        duration,
        fill: 'both',
        // 如果要切换到暗色主题，我们应该裁剪 view-transition-old(root) 的内容
        pseudoElement: isDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)'
      }
    )
  })
}