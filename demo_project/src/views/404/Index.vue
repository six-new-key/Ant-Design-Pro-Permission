<template>
  <div class="container">
    <div>
      <svg-icon name="404" height="220px" width="400px"></svg-icon>
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          <div style="margin-bottom: 30px">
            抱歉，页面不见了～
          </div>
          <router-link to="/home">
            <t-button type="primary">返回首页</t-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  width: 100%;
  background-color: var(--td-bg-color-container);
  color: var(--td-text-color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>