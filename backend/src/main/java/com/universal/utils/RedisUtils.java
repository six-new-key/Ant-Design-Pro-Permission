package com.universal.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class RedisUtils {

    private static RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public void setRedisTemplate(RedisTemplate<String, Object> redisTemplate) {
        RedisUtils.redisTemplate = redisTemplate;
    }

    /**
     * 使用SCAN命令安全地查找匹配模式的keys
     * 相比KEYS命令，SCAN不会阻塞Redis服务器
     *
     * @param pattern 匹配模式，如 "user:*" 或 "12345:*"
     * @return 匹配的key集合
     */
    public static Set<String> scanKeys(String pattern) {
        Set<String> keys = new HashSet<>();
        redisTemplate.execute((RedisCallback<Object>) connection -> {
            Cursor<byte[]> cursor = connection.scan(
                    ScanOptions.scanOptions()
                            .match(pattern)
                            .count(1000)
                            .build()
            );
            while (cursor.hasNext()) {
                keys.add(new String(cursor.next()));
            }
            try {
                cursor.close();
            } catch (Exception e) {
                // 静默处理游标关闭异常
            }
            return null;
        });
        return keys;
    }

    /**
     * 根据前缀查找keys
     *
     * @param prefix 前缀字符串
     * @return 匹配的key集合
     */
    public static Set<String> findKeysByPrefix(String prefix) {
        return scanKeys(prefix + "*");
    }

    /**
     * 根据用户ID前缀查找会话keys（针对格式如 "userId:sessionId" 的key）
     *
     * @param userId 用户ID
     * @return 匹配的会话key集合
     */
    public static Set<String> findConversationKeysByUserId(String userId) {
        return scanKeys(userId + ":*");
    }

    /**
     * 获取指定key的值
     *
     * @param key 键
     * @return 值
     */
    public static Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 设置键值对
     *
     * @param key 键
     * @param value 值
     */
    public static void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * 设置带过期时间的键值对
     *
     * @param key 键
     * @param value 值
     * @param timeout 过期时间（秒）
     */
    public static void set(String key, Object value, long timeout) {
        redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS);
    }

    /**
     * 删除指定key
     *
     * @param key 键
     * @return 是否删除成功
     */
    public static Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    /**
     * 批量删除keys
     *
     * @param keys 键集合
     * @return 成功删除的数量
     */
    public static Long delete(Collection<String> keys) {
        return redisTemplate.delete(keys);
    }

    /**
     * 判断key是否存在
     *
     * @param key 键
     * @return 是否存在
     */
    public static Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    /**
     * 设置过期时间
     *
     * @param key 键
     * @param timeout 过期时间（秒）
     * @return 是否设置成功
     */
    public static Boolean expire(String key, long timeout) {
        return redisTemplate.expire(key, timeout, TimeUnit.SECONDS);
    }

    /**
     * 获取过期时间
     *
     * @param key 键
     * @return 剩余过期时间（秒），-1表示永不过期，-2表示已过期或不存在
     */
    public static Long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 根据模式删除缓存
     * 使用SCAN命令安全地删除匹配的keys
     *
     * @param pattern 匹配模式，如：user:route:*
     * @return 删除的key数量
     */
    public static Long deleteByPattern(String pattern) {
        Set<String> keys = scanKeys(pattern);
        if (keys != null && !keys.isEmpty()) {
            return delete(keys);
        }
        return 0L;
    }
}

