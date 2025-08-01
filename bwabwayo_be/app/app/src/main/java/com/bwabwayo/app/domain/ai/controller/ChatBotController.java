package com.bwabwayo.app.domain.ai.controller;

import com.bwabwayo.app.domain.ai.dto.request.ChatBotRequest;
import com.bwabwayo.app.domain.ai.dto.response.OpenAiRecommendationResponse;
import com.bwabwayo.app.domain.ai.service.ChatBotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class ChatBotController {

    private final ChatBotService chatBotService;

    // 챗봇 응답 전체
    @PostMapping
    public ResponseEntity<OpenAiRecommendationResponse> chat(@RequestBody ChatBotRequest chatBotRequest) {
        OpenAiRecommendationResponse response = chatBotService.getRecommendation(chatBotRequest.getMessage());
        return ResponseEntity.ok(response);
    }

    // 추천한 상품 유사도 검색
}
