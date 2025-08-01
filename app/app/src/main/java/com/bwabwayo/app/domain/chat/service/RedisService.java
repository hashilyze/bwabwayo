package com.bwabwayo.app.domain.chat.service;

import com.bwabwayo.app.domain.chat.domain.ChatMessageRedisEntity;
import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RedisService {

    private final RedisTemplate<String, ChatMessageRedisEntity> redisTemplate;
    private final ChatMongoService chatMongoService;

    public RedisService(
            @Qualifier("messageRedisTemplate")
            RedisTemplate<String, ChatMessageRedisEntity> redisTemplate, ChatMongoService chatMongoService
    ) {
        this.redisTemplate = redisTemplate;
        this.chatMongoService = chatMongoService;
    }
    private static final int PAGE_SIZE = 20;
    private static final int MAX_CACHE_SIZE = 5;
    public List<MessageDTO> findMessages(Long roomId, int pageNumber) {
        String key = "chat:room:" + roomId;
        long start = (long) pageNumber * PAGE_SIZE;
        long end = start + PAGE_SIZE - 1;
        log.info(key);
        List<ChatMessageRedisEntity> cachedMessages = redisTemplate.opsForList().range(key, start, end);

        if (cachedMessages.isEmpty()) {
            return Collections.emptyList();
        }

        return cachedMessages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());

    }

    public void save(MessageDTO messageDTO) {
        String redisKey = "chat:room:" + messageDTO.getRoomId();
        ChatMessageRedisEntity entity = ChatMessageRedisEntity.of(messageDTO);

        // 객체 그대로 저장
        redisTemplate.opsForList().leftPush(redisKey, entity);
        redisTemplate.opsForList().trim(redisKey, 0, 99);
        log.info("✅ 저장된 객체: {}", entity);
    }

    public void saveMessageToRedis(MessageDTO message) {
        String key = "chat:room:" + message.getRoomId();
        redisTemplate.opsForList().rightPush(key, ChatMessageRedisEntity.of(message));

        // 캐시 사이즈 초과 시 -> MongoDB로 이전
        Long size = redisTemplate.opsForList().size(key);
        if (size != null && size >= MAX_CACHE_SIZE) {
            List<ChatMessageRedisEntity> messages = redisTemplate.opsForList().range(key, 0, -1);

            if (messages != null) {
                for (ChatMessageRedisEntity chatMessageRedisEntity : messages) {
                    chatMongoService.save(MessageDTO.fromEntity(chatMessageRedisEntity));
                }
                redisTemplate.delete(key); // 캐시 초기화
            }
        }
    }
}
