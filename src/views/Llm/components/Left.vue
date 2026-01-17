<template>
  <div class="left-content">
    <div class="create-new-chat">
      <div class="pro_logo_option">
        <a-flex justify="space-between">
          <a-flex justify="horizontal" align="center">
            <svg-icon name="vite" width="35" height="35" />
            <span style="margin-left: 8px;font-size: 18px;font-weight: 500;">畅聊新天地</span>
          </a-flex>
          <a-flex justify="flex-end" align="center">
            <a-button type="text" @click="handleCollapse">
              <template #icon>
                <AlignRightOutlined />
              </template>
            </a-button>
          </a-flex>
        </a-flex>
      </div>
      <a-button shape="round" size="large" :icon="h(PlusCircleOutlined)" block @click="handleCreateNewChat">开启新对话</a-button>
    </div>

    <div class="chat-history">
      <AXConversations :activeKey="activeKey" :menu="menuConfig" :items="historyList"
        @activeChange="handleActiveChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, h, watch } from 'vue'
import { EditOutlined, PlusCircleOutlined, DeleteOutlined, PushpinOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import { queryConversationHistory } from '@/api'
import { message } from '@/utils'
import { theme } from 'ant-design-vue';
import { useAppStore, useUserStore } from '@/stores'

const props = defineProps({
  newConversation: {
    type: Object,
    default: () => ({})
  },
  collapse: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['activeChange', 'createNewChat', 'collapse'])

const historyList = ref([])
const { token } = theme.useToken();
const appStore = useAppStore()
const userStore = useUserStore()
const activeKey = ref('')

const menuConfig = (conversation) => ({
  items: [
    {
      label: '重命名',
      key: 'operation1',
      icon: h(EditOutlined),
    },
    {
      label: '置顶',
      key: 'operation2',
      icon: h(PushpinOutlined),
      disabled: false,
    },
    {
      label: '分享',
      key: 'operation3',
      icon: h(ShareAltOutlined),
      disabled: false,
    },
    {
      label: '删除',
      key: 'operation4',
      icon: h(DeleteOutlined),
      danger: true,
    },
  ],
  onClick: (menuInfo) => {
    message.info(`Click ${conversation.key} - ${menuInfo.key}`);
  },
});

const handleActiveChange = (key) => {
  emit('activeChange', key)
  activeKey.value = key
}

const handleCreateNewChat = () => {
  emit('createNewChat')
  activeKey.value = ''
}

const handleQueryHistory = () => {
  queryConversationHistory().then(res => {
    historyList.value = res.data || []
  })
}

const handleCollapse = () => {
  emit('collapse', true)
}


watch(() => props.newConversation, (newVal) => {
  if (newVal) {
    historyList.value.unshift({
      key: newVal.conversationId,
      label: newVal.label,
      timestamp: null,
      group: '',
      icon: '',
      disabled: false,
    })
    activeKey.value = newVal.conversationId
  }
})

onMounted(() => {
  handleQueryHistory()
})
</script>

<style lang="scss" scoped>
.left-content {
  position: relative;
  height: 100%;

  .create-new-chat {
    padding: 0 6px;
    height: 106px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .pro_logo_option {
      line-height: 56px;
    }
  }

  .chat-history {
    height: calc(100% - 106px);
    width: 100%;
    overflow-y: scroll;
  }
}
</style>
