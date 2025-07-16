package com.ai.gemini_chat;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/qna")
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);
    private final QnAService qnAService;

    @PostMapping(value = "/ask", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> askQuestion(@RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        logger.info("Received question: {}", question);

        String answer = qnAService.getAnswer(question);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("answer", answer);

        return ResponseEntity.ok(response);
    }
}
