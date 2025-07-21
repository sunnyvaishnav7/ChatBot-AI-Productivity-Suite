package com.ai.gemini_chat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class QnAService {

    private static final Logger logger = LoggerFactory.getLogger(QnAService.class);

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public QnAService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String getAnswer(String question) {
        try {
            Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                    Map.of("parts", new Object[] {
                        Map.of("text", question)
                    })
                }
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(geminiApiUrl + "?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                logger.error("HTTP Error: {} - {}", response.statusCode(), response.body());
                return "Error: API returned status " + response.statusCode();
            }

            return parseResponse(response.body());

        } catch (Exception e) {
            logger.error("Service Error", e);
            return "Error: Service temporarily unavailable";
        }
    }

    private String parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            if (root.has("error")) {
                return "API Error: " + root.get("error").get("message").asText();
            }

            return root.get("candidates").get(0)
                      .get("content").get("parts").get(0)
                      .get("text").asText();
                      
        } catch (Exception e) {
            logger.error("Parse Error", e);
            return "Error: Could not parse response";
        }
    }
}