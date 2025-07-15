package com.ai.gemini_chat;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class QnAService {

    private static final Logger logger = LoggerFactory.getLogger(QnAService.class);

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public QnAService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    public String getAnswer(String question) {
        try {
            logger.info("Sending question to Gemini API: {}", question);

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                    Map.of("parts", new Object[] {
                        Map.of("text", question)
                    })
                }
            );

            String url = geminiApiUrl + "?key=" + geminiApiKey;

            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.debug("Raw Gemini API response: {}", response);

            return parseGeminiResponse(response);

        } catch (WebClientResponseException e) {
            logger.error("Gemini API HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API error: " + e.getStatusCode());
        } catch (Exception e) {
            logger.error("Unexpected error calling Gemini API", e);
            throw new RuntimeException("Service error: " + e.getMessage());
        }
    }

    private String parseGeminiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);

            if (root.has("error")) {
                String errorMsg = root.get("error").get("message").asText();
                throw new RuntimeException("Gemini API error: " + errorMsg);
            }

            JsonNode candidates = root.get("candidates");
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode text = parts.get(0).get("text");
                        if (text != null) {
                            return text.asText();
                        }
                    }
                }
            }

            throw new RuntimeException("Invalid response structure from Gemini API");

        } catch (Exception e) {
            logger.error("Error parsing Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini response");
        }
    }
}
