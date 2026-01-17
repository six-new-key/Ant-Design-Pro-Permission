/**
 * 动态背景工具类
 * 用于统一管理动态背景的创建、配置和销毁
 * 支持多种动态背景类型：优美流动、模糊渐变、背景光、抽象曲线、模糊圆点
 */

import { generate } from '@ant-design/colors'
import { isDynamicBgLoaded, getLoadedBgTypes } from './dynamicBgLoader'

// 动态背景类型配置
export const DYNAMIC_BG_TYPES = {
  AESTHETIC_FLUID: 'AestheticFluidBg',      // 优美流动
  CHAOS_WAVES: 'ChaosWavesBg',              // 混沌波浪
  SWIRLING_CURVES: 'SwirlingCurvesBg',      //  卷卷曲线
  BLUR_GRADIENT: 'BlurGradientBg',          // 模糊渐变
  ABSTRACT_SHAPE: 'AbstractShapeBg',        // 抽象曲线
  BLUR_DOT: 'BlurDotBg'                     // 模糊圆点
}

/**
 * 根据主题色生成渐变色数组
 * @param {string} primaryColor - 主题色 (hex格式)
 * @returns {Array} 渐变色数组
 */
export function generateThemeColors(primaryColor = '#1890ff') {
  try {
    // 使用 Ant Design 的颜色生成算法
    const colors = generate(primaryColor)
    
    // 选择合适的色阶用于渐变背景
    // 通常选择中等深度的颜色 (索引 2-6 对应色阶 3-7)
    const themeColors = [
      colors[2], // 较浅
      colors[3], // 中浅  
      colors[4], // 中等
      colors[5], // 中深
      colors[6], // 较深
      colors[2]  // 循环回到较浅色，形成平滑过渡
    ]
    
    console.log(`Generated theme colors from ${primaryColor}:`, themeColors)
    return themeColors
    
  } catch (error) {
    console.warn('Failed to generate theme colors, using default:', error)
    // 如果生成失败，返回默认的蓝色系渐变
    return ["#9FCFFF","#6BA3FA","#3667F0","#284CE0","#1F3A93","#9FCFFF"]
  }
}

// 默认配置
const DEFAULT_CONFIG = {
  colors: ["#9FCFFF","#6BA3FA","#3667F0","#284CE0","#9FCFFF","#6BA3FA"],
  loop: true
}

/**
 * 创建动态背景实例
 * @param {string} domId - DOM 元素的 ID
 * @param {string} bgType - 背景类型 (DYNAMIC_BG_TYPES 中的值)
 * @param {Object} options - 配置选项
 * @param {Array} options.colors - 渐变颜色数组
 * @param {boolean} options.loop - 是否循环动画
 * @returns {Object|null} 动态背景实例或 null
 */
export function createDynamicBg(domId, bgType = DYNAMIC_BG_TYPES.AESTHETIC_FLUID, options = {}) {
  try {
    // 调试信息：检查全局对象状态
    console.log('window.Color4Bg:', window.Color4Bg)
    console.log('Requested bgType:', bgType)
    console.log('Available types:', getLoadedBgTypes())
    
    // 检查动态背景库是否已加载
    if (!isDynamicBgLoaded(bgType)) {
      const availableTypes = getLoadedBgTypes()
      console.warn(`Dynamic background library ${bgType} not loaded. Available types:`, availableTypes)
      return null
    }

    // 检查 DOM 元素是否存在
    const element = document.getElementById(domId)
    if (!element) {
      console.warn(`Element with id "${domId}" not found`)
      return null
    }

    // 合并配置
    const config = {
      dom: domId,
      ...DEFAULT_CONFIG,
      ...options
    }

    console.log('Creating background with config:', config)

    // 创建实例
    const instance = new window.Color4Bg[bgType](config)
    
    console.log(`Dynamic background ${bgType} created for element: ${domId}`)
    return instance

  } catch (error) {
    console.error(`Failed to create dynamic background ${bgType}:`, error)
    return null
  }
}

/**
 * 销毁动态背景实例
 * @param {Object} instance - 动态背景实例
 */
export function destroyDynamicBg(instance) {
  try {
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy()
      console.log('Dynamic background instance destroyed')
    }
  } catch (error) {
    console.error('Failed to destroy dynamic background:', error)
  }
}

/**
 * 动态背景管理器类
 * 提供更高级的管理功能，支持多种背景类型
 */
class DynamicBgManager {
  constructor() {
    this.instances = new Map()
  }

  /**
   * 创建并管理动态背景实例
   * @param {string} domId - DOM 元素的 ID
   * @param {string} bgType - 背景类型
   * @param {Object} options - 配置选项
   * @returns {Object|null} 动态背景实例或 null
   */
  create(domId, bgType = DYNAMIC_BG_TYPES.AESTHETIC_FLUID, options = {}) {
    // 如果已存在实例，先销毁
    if (this.instances.has(domId)) {
      this.destroy(domId)
    }

    const instance = createDynamicBg(domId, bgType, options)
    if (instance) {
      this.instances.set(domId, { instance, bgType })
    }

    return instance
  }

  /**
   * 切换动态背景类型
   * @param {string} domId - DOM 元素的 ID
   * @param {string} newBgType - 新的背景类型
   * @param {Object} options - 配置选项
   * @returns {Object|null} 新的动态背景实例或 null
   */
  switchType(domId, newBgType, options = {}) {
    return this.create(domId, newBgType, options)
  }

  /**
   * 更新动态背景颜色
   * @param {string} domId - DOM 元素的 ID
   * @param {Array} colors - 新的颜色数组
   */
  updateColors(domId, colors) {
    const instanceData = this.instances.get(domId)
    if (instanceData) {
      // 重新创建实例以应用新颜色
      this.create(domId, instanceData.bgType, { colors })
    }
  }

  /**
   * 销毁指定的动态背景实例
   * @param {string} domId - DOM 元素的 ID
   */
  async destroy(domId) {
    const instanceData = this.instances.get(domId)
    if (instanceData) {
      await destroyDynamicBg(instanceData.instance)
      this.instances.delete(domId)
    }
  }

  /**
   * 销毁所有动态背景实例
   */
  async destroyAll() {
    for (const [domId, instanceData] of this.instances) {
      await destroyDynamicBg(instanceData.instance) 
    }
    this.instances.clear()
  }

  /**
   * 获取指定的动态背景实例
   * @param {string} domId - DOM 元素的 ID
   * @returns {Object|null} 动态背景实例或 null
   */
  getInstance(domId) {
    const instanceData = this.instances.get(domId)
    return instanceData ? instanceData.instance : null
  }

  /**
   * 检查是否存在指定的动态背景实例
   * @param {string} domId - DOM 元素的 ID
   * @returns {boolean} 是否存在实例
   */
  hasInstance(domId) {
    return this.instances.has(domId)
  }

  /**
   * 获取当前背景类型
   * @param {string} domId - DOM 元素的 ID
   * @returns {string|null} 背景类型或 null
   */
  getCurrentType(domId) {
    const instanceData = this.instances.get(domId)
    return instanceData ? instanceData.bgType : null
  }
}

// 创建全局管理器实例
export const dynamicBgManager = new DynamicBgManager()


export default {
  createDynamicBg,
  destroyDynamicBg,
  dynamicBgManager,
  generateThemeColors,
  DYNAMIC_BG_TYPES
}