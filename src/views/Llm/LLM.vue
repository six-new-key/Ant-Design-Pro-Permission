<template>
  <a-flex horizontal>
    <div :class="['left', { 'left-collapse': collapse }]">
      <Left v-if="!collapse" @activeChange="handleActiveChange" @createNewChat="handleCreateNewChat"
        @collapse="handleCollapse" :newConversation="newConversation" :collapse="collapse" />
      <div v-else class="collapse-button">
        <a-tooltip title="打开边栏" placement="bottom">
          <a-button type="text" :icon="h(AlignLeftOutlined)" @click="() => { collapse = false }" />
        </a-tooltip>
        <a-tooltip title="开启新对话" placement="bottom">
          <a-button type="text" :icon="h(PlusCircleOutlined)" @click="handleCreateNewChat" />
        </a-tooltip>
      </div>
    </div>
    <div :class="['right', { 'right-collapse': collapse }]">
      <Right :conversationId="conversationId" :createNewChat="createNewChat"
        @createNewChatSuccess="handleCreateNewChatSuccess" />
    </div>
  </a-flex>
</template>
<script setup>
import { ref, h } from 'vue'
import { AlignLeftOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import Left from './components/Left.vue';
import Right from './components/Right.vue';
import { theme } from 'ant-design-vue';

const { token } = theme.useToken();
const collapse = ref(false)
const conversationId = ref(null)
const newConversation = ref({})
const createNewChat = ref(false)

const handleCreateNewChatSuccess = (data) => {
  if (data) {
    //往左侧会话历史添加一条记录
    newConversation.value = data;
  } else {
    createNewChat.value = false
  }
}
const handleCreateNewChat = () => {
  createNewChat.value = true
}
const handleActiveChange = (key) => {
  conversationId.value = key
}
const handleCollapse = (value) => {
  collapse.value = value
}
</script>

<style scoped lang="scss">
//隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

.left {
  width: 18%;
  min-height: 84vh;
  max-height: 88vh;
  background: v-bind('token.colorFillTertiary');
  overflow-y: auto;
  border-right: 1px solid v-bind('token.colorBorder');
  transition: all 0.2s ease-in-out;
}

.left-collapse {
  width: 8%;
  background: v-bind('token.colorBgContainer');
  transition: all 0.2s ease-in-out;
  border: none;

  .collapse-button {
    max-width: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px;
    padding: 2px;
    border-radius: 50px;
    border: 1px solid v-bind('token.colorBorder');

    .ant-btn {
      border-radius: 50px;
    }
  }
}

.right {
  width: 82%;
  background: v-bind('token.colorBgContainer');
  min-height: 84vh;
  max-height: 88vh;
}

.right-collapse {
  width: 92%;
}
</style>
