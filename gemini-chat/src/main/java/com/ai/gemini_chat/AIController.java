package com.ai.gemini_chat;

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

    // @PostMapping("/ask")
    // public ResponseEntity<Map<String, Object>> askQuestion(@RequestBody Map<String, String> payload) {
    //     Map<String, Object> response = new HashMap<>();
    //     try {
    //         String question = payload.get("question");

    //         if (question == null || question.trim().isEmpty()) {
    //             response.put("error", "Question cannot be empty");
    //             response.put("success", false);
    //             return ResponseEntity.badRequest().body(response);
    //         }

    //         String answer = qnAService.getAnswer(question);

    //         if (answer == null || answer.trim().isEmpty()) {
    //             response.put("error", "Received empty response from Gemini API.");
    //             response.put("success", false);
    //             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    //         }

    //         response.put("question", question);
    //         response.put("answer", answer);
    //         response.put("success", true);
    //         response.put("timestamp", System.currentTimeMillis());

    //         return ResponseEntity.ok(response);

    //     } catch (Exception e) {
    //         logger.error("Error processing request", e);
    //         response.put("error", "Error processing request: " + e.getMessage());
    //         response.put("success", false);
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    //     }
    // }

//     @PostMapping(value = "/ask", consumes = "application/json")
// public ResponseEntity<String> askQuestion(@RequestBody Map<String, String> payload) {
//     String question = payload.get("question");
//     String answer = qnAService.getAnswer(question);
//     return ResponseEntity.ok(answer);

// }

 @PostMapping(value = "/ask", consumes = "application/json")
    public ResponseEntity<String> askQuestion(@RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        System.out.println("Received question: " + question);
        String answer = qnAService.getAnswer(question);
        return ResponseEntity.ok(answer);
    }
 

}
