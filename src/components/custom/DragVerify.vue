<template>
  <div ref="dragVerifyRef" class="drag_verify" :style="dragVerifyStyle" @mousemove="dragMoving" @mouseup="dragFinish"
    @mouseleave="dragFinish" @touchmove="dragMoving" @touchend="dragFinish">

    <div class="dv_progress_bar" :class="{ goFirst2: isOk }" ref="progressBarRef" :style="progressBarStyle">

    </div>
    <div class="dv_text" :style="textStyle" ref="messageRef">
      <slot name="textBefore" v-if="$slots.textBefore"></slot>
      {{ message }}
      <slot name="textAfter" v-if="$slots.textAfter"></slot>
    </div>

    <div class="dv_handler dv_handler_bg" :class="{ goFirst: isOk }" @mousedown="dragStart" @touchstart="dragStart"
      ref="handlerRef" :style="handlerStyle">
      <!-- <i :class="props.handlerIcon"></i> -->
      <DoubleRightOutlined v-if="!props.isPassing" />
      <CheckCircleOutlined v-if="props.isPassing" :style="{ color: props.progressBarBg }" />
    </div>

  </div>
</template>
<script setup>
import { ref, computed, onMounted, useSlots } from 'vue'
import { theme } from 'ant-design-vue'

const { token } = theme.useToken()

// 定义组件名称
defineOptions({
  name: 'dragVerify'
})

// 定义 props
const props = defineProps({
  isPassing: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 250
  },
  height: {
    type: Number,
    default: 40
  },
  text: {
    type: String,
    default: "swiping to the right side"
  },
  successText: {
    type: String,
    default: "success"
  },
  background: {
    type: String,
    default: "#eee"
  },
  progressBarBg: {
    type: String,
    default: "#76c61d"
  },
  completedBg: {
    type: String,
    default: "#76c61d"
  },
  circle: {
    type: Boolean,
    default: false
  },
  radius: {
    type: String,
    default: "4px"
  },
  handlerIcon: {
    type: String
  },
  successIcon: {
    type: String
  },
  handlerBg: {
    type: String,
    default: "#fff"
  },
  textSize: {
    type: String,
    default: "14px"
  },
  textColor: {
    type: String,
    default: "#333"
  }
})

// 定义 emits
const emit = defineEmits(['handlerMove', 'passfail', 'update:isPassing', 'passcallback'])

// 获取 slots
const slots = useSlots()

// 定义 refs
const dragVerifyRef = ref(null)
const progressBarRef = ref(null)
const messageRef = ref(null)
const handlerRef = ref(null)

// 定义响应式数据
const isMoving = ref(false)
const x = ref(0)
const isOk = ref(false)

// 计算属性
const handlerStyle = computed(() => {
  return {
    width: props.height + "px",
    height: props.height + "px",
    background: props.handlerBg
  }
})

const message = computed(() => {
  return props.isPassing ? props.successText : props.text
})

const dragVerifyStyle = computed(() => {
  return {
    width: props.width + "px",
    height: props.height + "px",
    lineHeight: props.height + "px",
    background: props.background,
    borderRadius: props.circle ? props.height / 2 + "px" : props.radius
  }
})

const progressBarStyle = computed(() => {
  return {
    background: props.progressBarBg,
    height: props.height + "px",
    borderRadius: props.circle
      ? props.height / 2 + "px 0 0 " + props.height / 2 + "px"
      : props.radius
  }
})

const textStyle = computed(() => {
  return {
    height: props.height + "px",
    width: props.width + "px",
    fontSize: props.textSize
  }
})

// 方法
const dragStart = (e) => {
  if (!props.isPassing) {
    isMoving.value = true
    x.value = (e.pageX || e.touches[0].pageX)
  }
  emit("handlerMove")
}

const dragMoving = (e) => {
  if (isMoving.value && !props.isPassing) {
    const _x = (e.pageX || e.touches[0].pageX) - x.value
    const handler = handlerRef.value
    if (_x > 0 && _x <= props.width - props.height) {
      handler.style.left = _x + "px"
      progressBarRef.value.style.width = _x + props.height / 2 + "px"
    } else if (_x > props.width - props.height) {
      handler.style.left = props.width - props.height + "px"
      progressBarRef.value.style.width = props.width - props.height / 2 + "px"
      passVerify()
    }
  }
}

const dragFinish = (e) => {
  if (isMoving.value && !props.isPassing) {
    const _x = (e.pageX || e.changedTouches[0].pageX) - x.value
    if (_x < props.width - props.height) {
      isOk.value = true
      setTimeout(() => {
        handlerRef.value.style.left = "0"
        progressBarRef.value.style.width = "0"
        isOk.value = false
      }, 500)
      emit("passfail")
    } else {
      const handler = handlerRef.value
      handler.style.left = props.width - props.height + "px"
      progressBarRef.value.style.width = props.width - props.height / 2 + "px"
      passVerify()
    }
    isMoving.value = false
  }
}

const passVerify = () => {
  emit("update:isPassing", true)
  isMoving.value = false
  const handler = handlerRef.value
  handler.children[0].className = props.successIcon
  progressBarRef.value.style.background = props.completedBg
  messageRef.value.style["-webkit-text-fill-color"] = "unset"
  messageRef.value.style.animation = "slidetounlock2 3s infinite"
  messageRef.value.style.color = "#fff"
  emit("passcallback")
}

const reset = () => {
  // 重置响应式数据
  isMoving.value = false
  x.value = 0
  isOk.value = false

  // 重置DOM样式
  const handler = handlerRef.value
  const message = messageRef.value
  handler.style.left = "0"
  progressBarRef.value.style.width = "0"
  handler.children[0].className = props.handlerIcon
  message.style["-webkit-text-fill-color"] = "transparent"
  message.style.animation = "slidetounlock 3s infinite"
  message.style.color = props.background
}

// 生命周期钩子
onMounted(() => {
  const dragEl = dragVerifyRef.value
  dragEl.style.setProperty("--textColor", props.textColor)
  dragEl.style.setProperty("--width", Math.floor(props.width / 2) + "px")
  dragEl.style.setProperty("--pwidth", -Math.floor(props.width / 2) + "px")
  console.log(slots)
})

// 暴露方法给父组件
defineExpose({
  reset
})
</script>
<style scoped>
.drag_verify {
  position: relative;
  background-color: v-bind('token.colorBgContainer');
  text-align: center;
  overflow: hidden;
}

.drag_verify .dv_handler {
  position: absolute;
  top: 0px;
  left: 0px;
  cursor: move;
  border: 1px solid v-bind('token.colorBorder');
  border-radius: v-bind('token.borderRadius + "px"');
}

.drag_verify .dv_handler i {
  color: v-bind('token.colorText');
  padding-left: 0;
  font-size: 16px;
}

.drag_verify .dv_handler .el-icon-circle-check {
  color: v-bind('token.colorSuccess');
  margin-top: 9px;
}

.drag_verify .dv_progress_bar {
  position: absolute;
  height: 34px;
  width: 0px;
}

.drag_verify .dv_text {
  position: absolute;
  top: 0px;
  color: transparent;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  -o-user-select: none;
  -ms-user-select: none;
  background: -webkit-gradient(linear,
      left top,
      right top,
      color-stop(0, v-bind('token.colorText')),
      color-stop(0.4, v-bind('token.colorText')),
      color-stop(0.5, v-bind('token.colorBgContainer')),
      color-stop(0.6, v-bind('token.colorText')),
      color-stop(1, v-bind('token.colorText')));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-size-adjust: none;
  animation: slidetounlock 3s infinite;
}

.drag_verify .dv_text * {
  -webkit-text-fill-color: v-bind('token.colorText');
}

.goFirst {
  left: 0px !important;
  transition: left 0.5s;
}

.goFirst2 {
  width: 0px !important;
  transition: width 0.5s;
}
</style>
<style>
@-webkit-keyframes slidetounlock {
  0% {
    background-position: var(--pwidth) 0;
  }

  100% {
    background-position: var(--width) 0;
  }
}

@-webkit-keyframes slidetounlock2 {
  0% {
    background-position: var(--pwidth) 0;
  }

  100% {
    background-position: var(--pwidth) 0;
  }
}
</style>