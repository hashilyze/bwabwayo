package com.bwabwayo.app.domain.chat.service;

import com.bwabwayo.app.domain.chat.domain.ChatMessageMongoEntity;
import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import com.bwabwayo.app.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatMongoService {

    private final ChatMessageRepository chatMessageRepository;
    private final MongoTemplate mongoTemplate;

    // 채팅 저장
    @Transactional
    public MessageDTO save(MessageDTO chatMessageDto) {

        ChatMessageMongoEntity chatMessage = chatMessageRepository.save(ChatMessageMongoEntity.of(chatMessageDto));
        log.info("save success : {}", chatMessage.getContent());
        return MessageDTO.fromEntity(chatMessage);
    }

    // 채팅 불러오기
    @Transactional(readOnly = true)
    public List<MessageDTO> findAll(Long roomId, Integer pageNumber) {
        return findByRoomIdWithPaging(roomId,pageNumber,20)
                .stream().map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }


    private Page<ChatMessageMongoEntity> findByRoomIdWithPaging(Long roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"time"));

        Query query = new Query()
                .with(pageable)
                .skip((long) pageable.getPageSize() * pageable.getPageNumber())
                .limit(pageable.getPageSize());

        query.addCriteria(Criteria.where("roomId").is(roomId));

        List<ChatMessageMongoEntity> filteredChatMessage = mongoTemplate.find(query, ChatMessageMongoEntity.class, "chat");
        Collections.sort(filteredChatMessage, Comparator.comparing(ChatMessageMongoEntity::getTime));
        return PageableExecutionUtils.getPage(
                filteredChatMessage,
                pageable,
                () -> mongoTemplate.count(query.skip(-1).limit(-1), ChatMessageMongoEntity.class)
        );
    }

    public ChatMessageMongoEntity findLatestMessageByRoomId(String roomId) {
        try {
            Query query = new Query(Criteria.where("roomId").is(roomId))
                    .with(Sort.by(Sort.Order.desc("_id")))
                    .limit(1);

            return mongoTemplate.findOne(query, ChatMessageMongoEntity.class);
        } catch (Exception e) {
            return null;
        }
    }



}