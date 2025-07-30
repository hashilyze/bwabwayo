package com.bwabwayo.app.domain.chat.domain;

import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Builder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collation = "chat")
public class ChatMessageMongoEntity {
    private String content;
    private String senderId;
    private String receiverId;
    private Long roomId;
    private Boolean isRead;
    private LocalDateTime time;
    private MessageType type;

    public static ChatMessageMongoEntity of(MessageDTO dto) {
        return ChatMessageMongoEntity.builder()
                .senderId(dto.getSenderId())
                .receiverId(dto.getReceiverId())
                .roomId(dto.getRoomId())
                .content(dto.getContent())
                .time(LocalDateTime.now())
                .type(dto.getType())
                .isRead(false)
                .build();
    }
}
