
/**
 * 处理会话标题，最长16位
 * @param {string} value 会话标题
 * @returns {string} 会话标题
 */
export const createConversationLabel = (value) => {
    // 如果字符串长度超过16，则截取前16个字符；否则返回原字符串
    return value.length <= 16 ? value : value.slice(0, 16);
}