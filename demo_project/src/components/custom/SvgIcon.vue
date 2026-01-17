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
    //颜色
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
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}
</style>