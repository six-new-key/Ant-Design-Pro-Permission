<template>
  <div class="container">
    <div>
      <svg-icon name="404" height="220px" width="400px"></svg-icon>
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          <div style="margin-bottom: 30px">
            <span>抱歉，页面不见了～</span>
          </div>
          <router-link to="/home">
            <a-button type="primary">返回</a-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { theme } from 'ant-design-vue';

const { token } = theme.useToken();
</script>
<style scoped lang='scss'>
.container {
  height: 100vh;
  width: 100%;
  background-color: v-bind('token.colorBgContainer');
  display: flex;
  justify-content: center;
  align-items: center;
  color: v-bind('token.colorText');
}
</style>