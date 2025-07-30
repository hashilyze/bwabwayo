package com.bwabwayo.app.domain.chat.controller;

import com.bwabwayo.app.domain.chat.domain.ChatRoom;
import com.bwabwayo.app.domain.chat.dto.MessageDTO;
import com.bwabwayo.app.domain.chat.dto.request.CreateChatRoomRequest;
import com.bwabwayo.app.domain.chat.dto.response.ChatRoomListResponse;
import com.bwabwayo.app.domain.chat.service.ChatMongoService;
import com.bwabwayo.app.domain.chat.service.ChatRoomService;
import com.bwabwayo.app.domain.chat.service.ChatService;
import com.bwabwayo.app.domain.chat.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatrooms")
@Slf4j
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMongoService chatMongoService;
    private final RedisService redisService;

    @GetMapping
    public ResponseEntity<List<ChatRoomListResponse>> getChatRoomList(
            //@RequestHeader("Authorization") String accessToken,
            @RequestParam String userId){
        log.info("get chatroom list");
        return ResponseEntity.ok(chatRoomService.getChatRoomList(userId));
    }


    @GetMapping("/{roomId}")
    public ResponseEntity<?> roomFindInfo(
            //@RequestHeader("Authorization") String accessToken,
            @PathVariable(name = "roomId") Long roomId,
            @RequestParam(name = "page") Integer pageNumber
    ) {
        List<MessageDTO> messages = redisService.findMessages(roomId, pageNumber);

        // Redis에 데이터가 없으면 MongoDB에서 조회
        if (messages.isEmpty()) {
            messages = chatMongoService.findAll(roomId, pageNumber);
        }

        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody CreateChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createRoom(request);
        return ResponseEntity.ok(chatRoom);
    }
}
