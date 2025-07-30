package com.bwabwayo.app.domain.chat.controller;

import com.bwabwayo.app.domain.chat.domain.ChatRoom;
import com.bwabwayo.app.domain.chat.dto.request.CreateChatRoomRequest;
import com.bwabwayo.app.domain.chat.dto.response.ChatRoomListResponse;
import com.bwabwayo.app.domain.chat.service.ChatMongoService;
import com.bwabwayo.app.domain.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatrooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMongoService chatMongoService;

    @GetMapping
    public ResponseEntity<List<ChatRoomListResponse>> getChatRoomList(
            //@RequestHeader("Authorization") String accessToken,
            @RequestParam String userId){
        return ResponseEntity.ok(chatRoomService.getChatRoomList(userId));
    }


    @GetMapping("/{roomId}")
    public ResponseEntity<?> roomFindInfo(
            //@RequestHeader("Authorization") String accessToken,
            @RequestParam(name = "roomId") Long roomId,
            @RequestParam(name = "page") Integer pageNumber
    ) {
        return ResponseEntity.ok(chatMongoService.findAll(roomId, pageNumber));
    }

    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody CreateChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createRoom(request);
        return ResponseEntity.ok(chatRoom);
    }
}
