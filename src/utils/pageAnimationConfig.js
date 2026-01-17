/**
 * 页面动画配置 - 统一管理动画选项和映射关系
 */

// 页面动画配置 - 统一管理动画选项和映射关系
export const PAGE_ANIMATION_CONFIG = {
  // 动画类型常量
  TYPES: {
    // 滑动动效
    SLIDE_LEFT: 'slide-left',
    SLIDE_RIGHT: 'slide-right',
    SLIDE_UP: 'slide-up',
    SLIDE_DOWN: 'slide-down',

    // 淡入淡出动效
    FADE: 'fade',
    FADE_IN_UP: 'fadeInUp',
    FADE_IN_DOWN: 'fadeInDown',
    FADE_IN_LEFT: 'fadeInLeft',
    FADE_IN_RIGHT: 'fadeInRight',

    // 缩放动效
    ZOOM: 'zoom',
    ZOOM_IN_DOWN: 'zoomInDown',

    // 翻转动效
    FLIP: 'flip',

    // 弹跳动效
    BOUNCE: 'bounce',
    BOUNCE_IN_LEFT: 'bounceInLeft',
    BOUNCE_IN_RIGHT: 'bounceInRight',

    // 旋转动效
    ROTATE_IN_DOWN_LEFT: 'rotateInDownLeft',
    ROTATE_IN_DOWN_RIGHT: 'rotateInDownRight',
    ROTATE_IN_UP_LEFT: 'rotateInUpLeft',
    ROTATE_IN_UP_RIGHT: 'rotateInUpRight',

    // 光速动效
    LIGHT_SPEED_IN_LEFT: 'lightSpeedInLeft',
    LIGHT_SPEED_IN_RIGHT: 'lightSpeedInRight',

    // 摆动动效
    SWING: 'swing',
    JELLO: 'jello',

    // 心跳动效
    PULSE: 'pulse'
  },

  // 动画选项配置（用于设置界面）
  get options() {
    return [
      // 滑动动效
      { value: this.TYPES.SLIDE_LEFT, label: '从左滑入', icon: 'chevron-right' },
      { value: this.TYPES.SLIDE_RIGHT, label: '从右滑入', icon: 'chevron-left' },
      { value: this.TYPES.SLIDE_UP, label: '从下滑入', icon: 'chevron-up' },
      { value: this.TYPES.SLIDE_DOWN, label: '从上滑入', icon: 'chevron-down' },
      // 淡入淡出动效
      { value: this.TYPES.FADE, label: '淡入淡出', icon: 'view-module' },
      { value: this.TYPES.FADE_IN_UP, label: '淡入向上', icon: 'arrow-up' },
      { value: this.TYPES.FADE_IN_DOWN, label: '淡入向下', icon: 'arrow-down' },
      { value: this.TYPES.FADE_IN_LEFT, label: '淡入向左', icon: 'arrow-left' },
      { value: this.TYPES.FADE_IN_RIGHT, label: '淡入向右', icon: 'arrow-right' },
      { value: this.TYPES.ZOOM_IN_DOWN, label: '放大向下', icon: 'aspect-ratio' },
      { value: this.TYPES.BOUNCE_IN_LEFT, label: '弹跳向左', icon: 'call-received' },
      { value: this.TYPES.BOUNCE_IN_RIGHT, label: '弹跳向右', icon: 'call-made' },
      // 旋转动效
      { value: this.TYPES.ROTATE_IN_DOWN_LEFT, label: '左下旋转', icon: 'rotate-ccw' },
      { value: this.TYPES.ROTATE_IN_DOWN_RIGHT, label: '右下旋转', icon: 'rotate-cw' },
      { value: this.TYPES.ROTATE_IN_UP_LEFT, label: '左上旋转', icon: 'undo' },
      { value: this.TYPES.ROTATE_IN_UP_RIGHT, label: '右上旋转', icon: 'redo' },
      // 光速动效
      { value: this.TYPES.LIGHT_SPEED_IN_LEFT, label: '光速左入', icon: 'fast-forward' },
      { value: this.TYPES.LIGHT_SPEED_IN_RIGHT, label: '光速右入', icon: 'fast-rewind' },
      // 缩放动效
      { value: this.TYPES.ZOOM, label: '缩放效果', icon: 'fullscreen' },
      // 弹跳动效
      { value: this.TYPES.BOUNCE, label: '弹跳效果', icon: 'jump' },
      // 翻转动效
      { value: this.TYPES.FLIP, label: '翻转效果', icon: 'swap' },
      // 摆动动效
      { value: this.TYPES.SWING, label: '摆动效果', icon: 'vibration' },
      { value: this.TYPES.JELLO, label: '果冻效果', icon: 'blur-on' },
      // 心跳动效
      { value: this.TYPES.PULSE, label: '脉冲效果', icon: 'radio-button-checked' }
    ]
  },

  // 动画映射关系（用于实际动画类名）
  get animationMap() {
    return {
      // 滑动动效
      [this.TYPES.SLIDE_LEFT]: 'animate__backInLeft',
      [this.TYPES.SLIDE_RIGHT]: 'animate__backInRight',
      [this.TYPES.SLIDE_UP]: 'animate__backInUp',
      [this.TYPES.SLIDE_DOWN]: 'animate__backInDown',

      // 淡入淡出动效
      [this.TYPES.FADE]: 'animate__fadeIn',
      [this.TYPES.FADE_IN_UP]: 'animate__fadeInUp',
      [this.TYPES.FADE_IN_DOWN]: 'animate__fadeInDown',
      [this.TYPES.FADE_IN_LEFT]: 'animate__fadeInLeft',
      [this.TYPES.FADE_IN_RIGHT]: 'animate__fadeInRight',

      // 缩放动效
      [this.TYPES.ZOOM]: 'animate__zoomIn',
      [this.TYPES.ZOOM_IN_DOWN]: 'animate__zoomInDown',

      // 翻转动效
      [this.TYPES.FLIP]: 'animate__flipInY',

      // 弹跳动效
      [this.TYPES.BOUNCE]: 'animate__bounceIn',
      [this.TYPES.BOUNCE_IN_LEFT]: 'animate__bounceInLeft',
      [this.TYPES.BOUNCE_IN_RIGHT]: 'animate__bounceInRight',

      // 旋转动效
      [this.TYPES.ROTATE_IN_DOWN_LEFT]: 'animate__rotateInDownLeft',
      [this.TYPES.ROTATE_IN_DOWN_RIGHT]: 'animate__rotateInDownRight',
      [this.TYPES.ROTATE_IN_UP_LEFT]: 'animate__rotateInUpLeft',
      [this.TYPES.ROTATE_IN_UP_RIGHT]: 'animate__rotateInUpRight',

      // 光速动效
      [this.TYPES.LIGHT_SPEED_IN_LEFT]: 'animate__lightSpeedInLeft',
      [this.TYPES.LIGHT_SPEED_IN_RIGHT]: 'animate__lightSpeedInRight',

      // 摆动动效
      [this.TYPES.SWING]: 'animate__swing',
      [this.TYPES.JELLO]: 'animate__jello',

      // 心跳动效
      [this.TYPES.PULSE]: 'animate__pulse'
    }
  },

  // 获取动画类名的方法
  getAnimationClass(animationType) {
    return this.animationMap[animationType] || 'animate__fadeIn'
  }
}

// 为了向后兼容，保留PAGE_ANIMATIONS的导出
export const PAGE_ANIMATIONS = PAGE_ANIMATION_CONFIG.TYPES