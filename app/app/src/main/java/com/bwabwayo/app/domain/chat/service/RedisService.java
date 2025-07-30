package com.bwabwayo.app.domain.chat.service;

import com.bwabwayo.app.domain.chat.domain.ChatMessageRedisEntity;
import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatMongoService chatMongoService;
    private static final int PAGE_SIZE = 20;
    private static final int MAX_CACHE_SIZE = 5;
    public List<MessageDTO> findMessages(Long roomId, int pageNumber) {
        String key = "chat:room:" + roomId;
        long start = (long) pageNumber * PAGE_SIZE;
        long end = start + PAGE_SIZE - 1;

        List<Object> cachedMessages = redisTemplate.opsForList().range(key, start, end);

        if (cachedMessages.isEmpty()) {
            return Collections.emptyList();
        }

        return cachedMessages.stream()
                .map(obj -> (MessageDTO) obj)
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
        redisTemplate.opsForList().rightPush(key, message);

        // 캐시 사이즈 초과 시 -> MongoDB로 이전
        Long size = redisTemplate.opsForList().size(key);
        if (size != null && size >= MAX_CACHE_SIZE) {
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);

            if (messages != null) {
                for (Object obj : messages) {
                    chatMongoService.save((MessageDTO) obj);
                }
                redisTemplate.delete(key); // 캐시 초기화
            }
        }
    }
}
