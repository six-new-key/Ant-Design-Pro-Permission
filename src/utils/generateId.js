/**
 * 自定义实现一个32位唯一ID生成函数
 * @returns {string} 生成的32位唯一ID
 */
export const generateUniqueId = () => {
	// 创建一个日期时间字符串，用于增加唯一性
	const timestamp = Date.now().toString(16);

	// 创建一个随机数字符串
	const randomString = Math.random().toString(16).slice(2);

	// 将日期时间字符串和随机数字符串拼接起来
	const combinedString = timestamp + randomString;

	// 截取前32位字符作为唯一ID
	return combinedString.slice(0, 32);
}