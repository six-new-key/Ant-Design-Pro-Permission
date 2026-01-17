import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

/**
 * NProgress 进度条配置
 * 提供统一的进度条配置和样式设置
 */

// 配置NProgress
const configureNProgress = () => {
  NProgress.configure({ 
    showSpinner: false, // 不显示加载图标
    minimum: 0.2, // 最小百分比
    easing: 'ease', // 动画方式
    speed: 500, // 递增进度条的速度
    trickleSpeed: 200, // 递增速度
    parent: 'body', // 指定父容器
  })
}

// 设置自定义进度条样式
const setNProgressStyle = (barColor) => {
  const style = document.createElement('style')
  style.textContent = `
    #nprogress .bar {
      background: ${barColor ? barColor : ''} !important; /* 使用主题蓝色 */
    }
  `
  document.head.appendChild(style)
}

// 初始化NProgress配置和样式
const initNProgress = () => {
  configureNProgress()
  setNProgressStyle()
}

// 导出NProgress实例和初始化函数
export { NProgress, initNProgress, configureNProgress, setNProgressStyle }

// 默认导出初始化函数
export default initNProgress