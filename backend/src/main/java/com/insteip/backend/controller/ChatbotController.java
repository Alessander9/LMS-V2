package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.chatbot.ChatRequest;
import com.insteip.backend.domain.dto.chatbot.ChatResponse;
import com.insteip.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.processChat(request);
        return ResponseEntity.ok(response);
    }
}
