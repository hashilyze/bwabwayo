package com.bwabwayo.app.domain.notification.service;

import com.bwabwayo.app.domain.chat.domain.ChatRoom;
import com.bwabwayo.app.domain.chat.repository.ChatRoomRepository;
import com.bwabwayo.app.domain.notification.dto.NotificationDTO;
import com.bwabwayo.app.domain.notification.dto.response.NotificationResponse;
import com.bwabwayo.app.domain.notification.repository.NotificationRedisRepository;
import com.bwabwayo.app.domain.product.domain.Product;
import com.bwabwayo.app.domain.product.service.ProductService;
import com.bwabwayo.app.domain.user.domain.User;
import com.bwabwayo.app.domain.user.service.UserService;
import com.bwabwayo.app.global.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRedisRepository notificationRedisRepository;
    private final StorageService storageService;
    private final UserService userService;
    private final ProductService productService;
    private final ChatRoomRepository chatRoomRepository;


    // ===================== upsert =======================

    public void upsert(String receiverId, Long productId, Long roomId, String message){
        notificationRedisRepository.upsert(receiverId, productId, roomId, message, LocalDateTime.now(ZoneId.of("Asia/Seoul")));
    }

    // ===================== mark-read =======================

    public void markRead(String receiverId, Long notificationId){
        notificationRedisRepository.markRead(receiverId, notificationId);
    }

    public void markChatRead(String receiverId, Long roomId){
        notificationRedisRepository.markChatRead(receiverId, roomId);
    }

    public void markProductRead(String receiverId, Long roomId){
        notificationRedisRepository.markProductRead(receiverId, roomId);
    }

    public Page<NotificationDTO> findInbox(String receiverId, Pageable pageable){
        return notificationRedisRepository.findInbox(receiverId, pageable);
    }

    public NotificationResponse build(NotificationDTO notification){
        String receiverId = notification.getReceiverId();
        Long productId = notification.getProductId();
        Long roomId = notification.getChatroomId();

        User receiver = userService.findById(receiverId);
        Product product = productId != null ? productService.findById(productId) : null;
        ChatRoom chatRoom = roomId != null ?  chatRoomRepository.findById(roomId).orElse(null) : null;

        var builder = NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .unreadCount(notification.getUnreadCount())
                .createdAt(notification.getUpdatedAt())
                .receiverId(receiver.getId());

        if(chatRoom != null){ // 채팅
            User other = userService.findById(chatRoom.getOtherUserId(receiver.getId()));
            if(product == null) product = productService.findById(chatRoom.getProductId());
            builder.title(product.getTitle() + " from. " + other.getNickname())
                    .thumbnail(storageService.getUrlFromKey(product.getThumbnail()))
                    .productId(product.getId())
                    .chatroomId(chatRoom.getRoomId());
        } else if(product != null){ // 상품
            builder.title(product.getTitle())
                    .thumbnail(storageService.getUrlFromKey(product.getThumbnail()))
                    .productId(product.getId());
        } else{ // 사용자
            builder.title("to. " + receiver.getNickname())
                    .thumbnail(storageService.getUrlFromKey(receiver.getProfileImage()));
        }

        return builder.build();
    }
}
