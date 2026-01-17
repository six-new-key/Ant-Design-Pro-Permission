<template>
    <!-- 使用父组件指定的图标大小 -->
    <svg :style="{ width, height }">
        <!-- 使用父组件指定的图标和图标颜色 -->
        <use :xlink:href="prefix + name" :fill="color"></use>
    </svg>
</template>

<script setup>
import { ref, onMounted } from 'vue'

//接收父组件传递过来的参数
defineProps({
    //xlink:href属性值前缀
    prefix: {
        type: String,
        default: '#icon-'
    },
    //svg名字
    name: String,
    //颜色说明：如果想要通过属性设置则在复制svg代码时将其fill固定颜色值删除才会生效
    color: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: '45px'
    },
    width: {
        type: String,
        default: '45px'
    },
})
</script>
<style scoped>
svg {
  display: inline-block;
  vertical-align: -0.22em; /* 微调SVG图标的垂直对齐位置,使其更精确地居中 */
  fill: currentColor;
  overflow: hidden;
}
</style>