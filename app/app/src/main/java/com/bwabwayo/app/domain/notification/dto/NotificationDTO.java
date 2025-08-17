package com.bwabwayo.app.domain.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;

    private String receiverId;

    private Long productId;   // null 가능

    private Long chatroomId;  // null 가능

    private String message;

    private LocalDateTime updatedAt; // Asia/Seoul

    private boolean isRead;

    private int unreadCount;
}
