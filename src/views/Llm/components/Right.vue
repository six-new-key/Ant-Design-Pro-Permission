<template>
    <div class="right-wrapper">
        <!-- 重连提示 -->
        <div v-if="isReconnecting" class="reconnect-notice">
            <a-alert message="连接中断，正在重连..." type="warning" show-icon />
        </div>

        <!-- 对话内容区：可滚动 -->
        <div class="chat-content" ref="chatContentRef">
            <!-- 欢迎消息 -->
            <div class="welcome-message">
                <AXWelcome variant="borderless"
                    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                    title="Hello, I'm Ant Design X"
                    description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~">
                </AXWelcome>
            </div>

            <!-- 对话消息 -->
            <a-spin v-if="loadingMsg" class="spin-loading" :spinning="loadingMsg" tip="加载中..." />

            <div v-else class="chat-messages">
                <div v-for="(msg, index) in messages" :key="index" class="message-item">
                    <!-- 非思考模式 -->
                    <template v-if="!msg.enableThink">
                        <AXBubble :placement="msg.placement" :loading="msg.loading"
                            :variant="msg.placement === 'start' ? 'borderless' : 'outlined'"
                            :content="msg.text.answerContent" shape="corner">
                            <template #avatar>
                                <a-avatar v-if="msg.placement === 'start'"
                                    src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
                                <a-avatar v-else :style="{ backgroundColor: token.colorPrimary }">
                                    <template #icon>
                                        <UserOutlined />
                                    </template>
                                </a-avatar>
                            </template>
                            <template #message="{ content }">
                                <MarkdownRender :content="content" />
                            </template>
                            <template #footer="{ content }">
                                <a-space :size="token.paddingXXS">
                                    <a-button type="text" size="small" :icon="h(SyncOutlined)"
                                        @click="handleRetry(index)" />
                                    <a-button type="text" size="small" :icon="h(CopyOutlined)"
                                        @click="handleCopy(content)" />
                                </a-space>
                            </template>
                        </AXBubble>
                    </template>

                    <!-- 思考模式 -->
                    <template v-else>
                        <!-- 大模型 -->
                        <template v-if="msg.placement === 'start'">
                            <AXBubble :placement="msg.placement" :loading="msg.loading" shape="corner">
                                <template #avatar>
                                    <a-avatar
                                        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
                                </template>
                                <template #message>
                                    <a-space direction="vertical" :size="msg.collapse ? 5 : 10">
                                        <a-space @click="() => {
                                            msg.collapse = !msg.collapse;
                                        }" style="cursor: pointer;" :size="5" direction="horizontal">
                                            <span style="opacity: 0.7;">已深度思考</span>
                                            <UpOutlined :style="{ fontSize: '12px', opacity: 0.7 }"
                                                v-if="!msg.collapse" />
                                            <DownOutlined :style="{ fontSize: '12px', opacity: 0.7 }" v-else />
                                        </a-space>

                                        <AXBubble
                                            :style="{ borderLeft: `2px solid ${token.colorBorder}`, paddingLeft: '12px', opacity: 0.7 }"
                                            v-show="!msg.collapse && !msg.loading" variant="borderless"
                                            :content="msg.text.thinkContent">
                                            <template #message="{ content }">
                                                <MarkdownRender :content="content" />
                                            </template>
                                        </AXBubble>
                                    </a-space>
                                </template>
                                <template #footer>
                                    <a-space direction="vertical">
                                        <AXBubble variant="borderless" :content="msg.text.answerContent">
                                            <template #message="{ content }">
                                                <MarkdownRender :content="content" />
                                            </template>
                                        </AXBubble>

                                        <a-space :size="token.paddingXXS">
                                            <a-button type="text" size="small" :icon="h(SyncOutlined)"
                                                @click="handleRetry(index)" />
                                            <a-button type="text" size="small" :icon="h(CopyOutlined)"
                                                @click="handleCopy(msg.text.answerContent)" />
                                        </a-space>
                                    </a-space>
                                </template>
                            </AXBubble>
                        </template>
                        <!-- 用户 -->
                        <template v-else>
                            <AXBubble :placement="msg.placement" variant="outlined" :content="msg.text.answerContent"
                                shape="corner">
                                <template #avatar>
                                    <a-avatar :style="{ backgroundColor: token.colorPrimary }">
                                        <template #icon>
                                            <UserOutlined />
                                        </template>
                                    </a-avatar>
                                </template>
                                <template #message="{ content }">
                                    <MarkdownRender :content="content" />
                                </template>
                                <template #footer="{ content }">
                                    <a-space :size="token.paddingXXS">
                                        <a-button type="text" size="small" :icon="h(SyncOutlined)"
                                            @click="handleRetry(index)" />
                                        <a-button type="text" size="small" :icon="h(CopyOutlined)"
                                            @click="handleCopy(content)" />
                                    </a-space>
                                </template>
                            </AXBubble>
                        </template>
                    </template>
                </div>
            </div>
        </div>

        <!-- 消息发送区：固定在底部 -->
        <div class="sender">
            <AXSender :allow-speech="true" :actions="false" v-model:value="messageValue"
                :auto-size="{ minRows: 2, maxRows: 8 }" @submit="handleSubmit" @cancel="handleCancel">
                <template #footer="{ info: { components: { SendButton, LoadingButton } } }">
                    <a-flex justify="space-between" align="center">
                        <a-flex gap="small" align="center">
                            <div>
                                <a-select v-model:value="selectedModel" style="width: 120px"
                                    :options="modelList"></a-select>
                            </div>
                            <div :class="['left-options-common', { 'think-active': enableThinking }]"
                                @click="() => enableThinking = !enableThinking">
                                <svg-icon name="think" width="16" height="16"
                                    :color="enableThinking ? token.colorPrimary : '#333'" />
                                <span style="margin-left: 4px;">深度思考</span>
                            </div>
                            <div :class="['left-options-common', { 'search-active': enableSearch }]"
                                @click="() => enableSearch = !enableSearch">
                                <GlobalOutlined />
                                <span style="margin-left: 4px;">联网搜索</span>
                            </div>
                        </a-flex>
                        <a-flex align="center">
                            <a-button :style="iconStyle" type="text" :icon="h(LinkOutlined)" />
                            <a-divider type="vertical" />
                            <component :is="LoadingButton" v-if="submitLoading" type="default" />
                            <component :is="SendButton" v-else type="primary" :disabled="false" />
                        </a-flex>
                    </a-flex>
                </template>
            </AXSender>
        </div>
    </div>
</template>

<script setup>
import { ref, h, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { UserOutlined, RobotOutlined, CopyOutlined, SyncOutlined, LinkOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message, generateUniqueId, createConversationLabel } from '@/utils';
import { useAppStore, useUserStore } from '@/stores'
import { theme } from 'ant-design-vue';
import { chatStream, queryAllModelList, queryMessages } from '@/api'
import { MarkdownCodeBlockNode, setCustomComponents, MarkdownRender } from 'vue-renderer-markdown'
import 'vue-renderer-markdown/index.css'

setCustomComponents({
    code_block: MarkdownCodeBlockNode,
})

// 定义props
const props = defineProps({
    conversationId: {
        type: String,
        default: ''
    },
    createNewChat: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['createNewChatSuccess'])

// 定义state
const messageValue = ref('')
const submitLoading = ref(false)
const loadingMsg = ref(false)
const chatContentRef = ref(null)
const isReconnecting = ref(false)
const { token } = theme.useToken();
const appStore = useAppStore()
const userStore = useUserStore()
const modelList = ref([])
// 消息索引
let currentAiMessageIndex = -1
// 初始化消息
const messages = ref([])
// 定义选中的模型
const selectedModel = ref('')
const iconStyle = {
    fontSize: 18,
    color: token.value.colorText,
}
// 定义会话ID
const conversationId = ref(null)

//深度思考相关
const isThinkComplete = ref(false);
const isAnswerComplete = ref(false);
const hasThinkStarted = ref(false);
const hasAnswerStarted = ref(false);
const enableThinking = ref(false);
const enableSearch = ref(false);

// 头像样式
const getAvatarStyle = (placement) => {
    const baseStyle = {
        color: '#fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    if (placement === 'end') {
        return {
            icon: h(UserOutlined),
            style: {
                ...baseStyle,
                backgroundColor: '#1890ff',
            }
        };
    } else {
        return {
            icon: h(RobotOutlined),
            style: {
                ...baseStyle,
                backgroundColor: '#52c41a',
            }
        };
    }
};

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContentRef.value) {
            chatContentRef.value.scrollTo({
                top: chatContentRef.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    });
};

// 处理发送
const handleSubmit = async (value) => {
    if (!value) return;

    messageValue.value = ''

    // 添加用户消息
    messages.value.push({
        placement: 'end',
        text: {
            thinkContent: '',
            answerContent: value
        },
        loading: false,
        enableThink: enableThinking.value,
        collapse: false,
    });

    submitLoading.value = true;

    // 添加AI消息占位
    currentAiMessageIndex = messages.value.length;
    messages.value.push({
        placement: 'start',
        text: {
            thinkContent: '',
            answerContent: ''
        },
        loading: true,
        enableThink: enableThinking.value,
        collapse: false,
    });

    scrollToBottom();

    //调用后端接口
    handleChatStream(value)
}

// 处理请求
const handleChatStream = async (value) => {
    // 初始化会话ID
    if (!conversationId.value) {
        conversationId.value = generateUniqueId()
        //往左侧会话历史添加一条记录
        emit('createNewChatSuccess', {
            conversationId: conversationId.value,
            label: createConversationLabel(value),
        })
    }

    // 更新chatDto
    const chatDto = {
        model: selectedModel.value,
        conversationId: conversationId.value,
        prompt: value,
        enableThink: enableThinking.value,
        enableSearch: enableSearch.value,
    }

    try {
        //后端请求
        const response = await chatStream(chatDto);

        messages.value[currentAiMessageIndex].loading = false;

        if (enableThinking.value) {
            handleThinkingResponse(response)
        } else {
            handleNonThinkingResponse(response)
        }
    } catch (err) {
        console.error('Stream error:', err);
        message.error('请求失败: ' + err.message);
        submitLoading.value = false;

        if (currentAiMessageIndex < messages.value.length) {
            messages.value.splice(currentAiMessageIndex, 1);
        }
    }
};

// 处理非思考模式响应
const handleNonThinkingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastUpdateTime = 0;
    const updateInterval = 50; // 50ms 更新一次

    try {
        while (true) {
            const { done, value: chunk } = await reader.read();

            if (done) {
                // 最后更新
                if (buffer.trim()) {
                    messages.value[currentAiMessageIndex].text.answerContent += buffer;
                    scrollToBottom();
                }
                submitLoading.value = false;
                console.log('Stream completed');
                break;
            }

            const text = decoder.decode(chunk, { stream: true });
            buffer += text;

            // 节流更新，避免过于频繁的 DOM 操作
            const now = Date.now();
            if (now - lastUpdateTime > updateInterval) {
                if (buffer.trim()) {
                    messages.value[currentAiMessageIndex].text.answerContent += buffer;
                    messages.value[currentAiMessageIndex].loading = false;
                    buffer = '';
                    lastUpdateTime = now;
                    scrollToBottom();
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

// 处理思考模式响应
const handleThinkingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentMode = null; // 'think' 或 'answer'
    let lastUpdateTime = 0;
    const updateInterval = 50;
    const maxBufferSize = 512 * 1024;
    const minIdentifierLength = 6; // 'THINK:' 的最小长度

    const processBuffer = () => {
        let processed = false;

        while (true) {
            // 查找所有标识符的位置
            const thinkIndex = buffer.indexOf('THINK:');
            const answerIndex = buffer.indexOf('ANSWER:');

            // 确定下一个要处理的标识符
            let nextIndex = -1;
            let nextMode = null;
            let nextIdentifierLength = 0;

            // 找到最早出现的标识符
            if (thinkIndex !== -1 && answerIndex !== -1) {
                if (thinkIndex < answerIndex) {
                    nextIndex = thinkIndex;
                    nextMode = 'think';
                    nextIdentifierLength = 6; // 'THINK:'.length
                } else {
                    nextIndex = answerIndex;
                    nextMode = 'answer';
                    nextIdentifierLength = 7; // 'ANSWER:'.length
                }
            } else if (thinkIndex !== -1) {
                nextIndex = thinkIndex;
                nextMode = 'think';
                nextIdentifierLength = 6;
            } else if (answerIndex !== -1) {
                nextIndex = answerIndex;
                nextMode = 'answer';
                nextIdentifierLength = 7;
            }

            // 如果没有找到标识符，退出循环
            if (nextIndex === -1) {
                break;
            }

            // 处理标识符之前的内容
            if (nextIndex > 0 && currentMode) {
                const prevContent = buffer.substring(0, nextIndex);
                if (prevContent.trim()) {
                    updateContent(currentMode, prevContent);
                }
            }

            // 切换模式并移除已处理的内容
            currentMode = nextMode;
            buffer = buffer.substring(nextIndex + nextIdentifierLength);
            processed = true;

            // 继续处理剩余的 buffer，可能还有其他标识符
        }

        return processed;
    };

    const updateContent = (mode, content) => {
        try {
            if (mode === 'think') {
                messages.value[currentAiMessageIndex].text.thinkContent += content;
                if (!hasThinkStarted.value) {
                    hasThinkStarted.value = true;
                }
            } else if (mode === 'answer') {
                messages.value[currentAiMessageIndex].text.answerContent += content;
                if (!hasAnswerStarted.value) {
                    hasAnswerStarted.value = true;
                    // 标记思考完成
                    if (hasThinkStarted.value && !isThinkComplete.value) {
                        isThinkComplete.value = true;
                    }
                }
            }
            messages.value[currentAiMessageIndex].loading = false;
        } catch (error) {
            console.error('Error updating content:', error);
        }
    };

    const shouldKeepBuffer = () => {
        // 检查 buffer 末尾是否可能包含不完整的标识符
        const bufferEnd = buffer.slice(-10); // 检查最后10个字符
        return bufferEnd.includes('T') || bufferEnd.includes('A') ||
            bufferEnd.includes('TH') || bufferEnd.includes('THI') ||
            bufferEnd.includes('THIN') || bufferEnd.includes('AN') ||
            bufferEnd.includes('ANS') || bufferEnd.includes('ANSW') ||
            bufferEnd.includes('ANSWE');
    };

    const getUpdateInterval = (bufferLength) => {
        // 根据缓冲区大小动态调整更新频率
        if (bufferLength > 10000) return 100; // 大量数据时降低频率
        if (bufferLength > 1000) return 75;
        return 50; // 默认频率
    };

    try {
        while (true) {
            const { done, value: chunk } = await reader.read();
            if (done) {
                // 处理剩余内容
                if (buffer.trim() && currentMode) {
                    updateContent(currentMode, buffer);
                    scrollToBottom();
                }
                onStreamComplete();
                submitLoading.value = false;
                console.log('Stream completed');
                break;
            }

            const text = decoder.decode(chunk, { stream: true });
            buffer += text;

            // 防止内存溢出
            if (buffer.length > maxBufferSize) {
                console.warn('Buffer size exceeded, forcing update');
                if (currentMode && buffer.trim()) {
                    // 保留可能的不完整标识符
                    const keepLength = Math.min(20, buffer.length);
                    const contentToUpdate = buffer.substring(0, buffer.length - keepLength);
                    const remainingBuffer = buffer.substring(buffer.length - keepLength);

                    if (contentToUpdate.trim()) {
                        updateContent(currentMode, contentToUpdate);
                        scrollToBottom();
                    }
                    buffer = remainingBuffer;
                }
                lastUpdateTime = Date.now();
                continue;
            }

            // 尝试处理标识符
            const hasIdentifier = processBuffer();

            // 动态节流更新内容
            const now = Date.now();
            const dynamicInterval = getUpdateInterval(buffer.length);

            if (now - lastUpdateTime > dynamicInterval) {
                if (currentMode && buffer.trim()) {
                    // 如果没有找到新标识符，且当前有模式
                    if (!hasIdentifier) {
                        // 检查是否应该保留部分 buffer（可能包含不完整的标识符）
                        if (shouldKeepBuffer() && buffer.length < 1000) {
                            // 保留 buffer，等待更多数据
                        } else {
                            // 安全更新内容
                            let contentToUpdate = buffer;
                            let remainingBuffer = '';

                            // 如果 buffer 很长，保留末尾可能的不完整标识符
                            if (buffer.length > 100 && shouldKeepBuffer()) {
                                contentToUpdate = buffer.substring(0, buffer.length - 10);
                                remainingBuffer = buffer.substring(buffer.length - 10);
                            }

                            if (contentToUpdate.trim()) {
                                updateContent(currentMode, contentToUpdate);
                                scrollToBottom();
                            }
                            buffer = remainingBuffer;
                        }
                    }
                }
                lastUpdateTime = now;
            }
        }
    } catch (error) {
        console.error('Stream processing error:', error);
        submitLoading.value = false;
        // 错误处理
        if (buffer.trim() && currentMode) {
            try {
                updateContent(currentMode, buffer);
                scrollToBottom();
            } catch (handleError) {
                console.error('Error handling remaining buffer:', handleError);
            }
        }

        // 确保状态重置
        if (currentAiMessageIndex >= 0 && currentAiMessageIndex < messages.value.length) {
            messages.value[currentAiMessageIndex].loading = false;
        }

        onStreamComplete();
        throw error;
    } finally {
        try {
            reader.releaseLock();
        } catch (releaseError) {
            console.error('Error releasing reader lock:', releaseError);
        }
    }
}

//处理流完成，更新消息状态
const onStreamComplete = () => {
    // 确保所有内容都正确结束
    if (hasThinkStarted.value && !isThinkComplete.value) {
        isThinkComplete.value = true;
    }

    if (hasAnswerStarted.value && !isAnswerComplete.value) {
        isAnswerComplete.value = true;
    }
}

// 取消发送
const handleCancel = () => {
    messageValue.value = ''
}

// 重试发送
const handleRetry = (index) => {
    if (index < 0 || index >= messages.value.length) return;

    const message = messages.value[index];
    if (message.placement !== 'end') return;

    console.log(message)

    messageValue.value = message.text.answerContent
};

// 复制文本
const handleCopy = (textToCopy) => {
    if (!textToCopy) return message.success('Text is empty');
    navigator.clipboard.writeText(textToCopy).then(() => {
        message.success('Text copied successfully');
    }).catch(err => {
        message.error('Failed to copy text');
    });
};

//根据会话ID查询消息列表
const handleQueryMsgListById = async () => {
    if (!props.conversationId) return
    const res = await queryMessages(props.conversationId)
    // 清空旧消息
    messages.value = []
    if (res.code === 200) {
        messages.value = res.data || []
        loadingMsg.value = false
    }
    // 滚动到底部
    scrollToBottom();
}

//监听 conversationId 变化
watch(() => props.conversationId, async (newVal, oldVal) => {
    if (newVal !== oldVal) {
        conversationId.value = newVal
        loadingMsg.value = true
        // 处理 conversationId 变化后的逻辑
        await handleQueryMsgListById()
    }
})

//监听 新建会话 变化
watch(() => props.createNewChat, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        if (newVal) {
            // 触发创建新会话成功事件
            emit('createNewChatSuccess')
            // 清空旧消息
            conversationId.value = null
            messages.value = []
            messageValue.value = ''
            messages.value = [{
                placement: 'start',
                text: {
                    thinkContent: '',
                    answerContent: '你好，我是AI助手，有什么可以帮助你的吗？'
                },
                loading: false,
                enableThink: false,
                collapse: false,
            }]
            // 滚动到底部
            scrollToBottom();
        }
    }
})

// 初始化模型列表
const initModelList = async () => {
    const res = await queryAllModelList()
    if (res.code === 200) {
        modelList.value = res.data || []
        // 初始化选中的模型
        selectedModel.value = modelList.value[0]?.value || ''
    }
}

// 页面加载完成后滚动到底部
onMounted(() => {
    scrollToBottom();
    initModelList()
});

// 组件卸载时取消事件监听
onUnmounted(() => {
    conversationId.value = null
})
</script>

<style scoped lang="scss">
.right-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 50px 0 50px;

    .reconnect-notice {
        margin-bottom: 16px;
    }

    .chat-content {
        flex: 1;
        overflow-y: auto;
        padding-bottom: 250px;

        .spin-loading {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .welcome-message {
            margin-bottom: 50px;
        }

        .chat-messages {
            .message-item {
                margin-bottom: 24px;
            }
        }
    }

    .sender {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        padding: 0 50px 20px 50px;
        background: v-bind('token.colorBgContainer');

        .left-options-common {
            margin-left: 10px;
            // height: 32px;
            cursor: pointer;
            border-radius: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 8px 16px;
            border: 1px solid v-bind('token.colorBorder');
            background: v-bind('token.colorBgContainer');
            font-weight: 500;
        }

        .left-options-common:hover {
            background: v-bind('token.colorFillTertiary');
        }

        .think-active {
            background: v-bind('token.colorPrimary + 20');
            border: 1px solid v-bind('token.colorPrimary + 40');
            color: v-bind('token.colorPrimary');
        }

        .search-active {
            background: v-bind('token.colorPrimary + 20');
            border: 1px solid v-bind('token.colorPrimary + 40');
            color: v-bind('token.colorPrimary');
        }

        .think-active:hover {
            background: v-bind('token.colorPrimary + 20');
        }

        .search-active:hover {
            background: v-bind('token.colorPrimary + 20');
        }
    }
}
</style>