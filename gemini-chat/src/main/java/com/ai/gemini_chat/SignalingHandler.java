package com.ai.gemini_chat;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class SignalingHandler extends TextWebSocketHandler {
    // Map<meetingId, Set<session>>
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // meetingId is required as a query param
        String meetingId = getMeetingId(session);
        rooms.computeIfAbsent(meetingId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String meetingId = getMeetingId(session);
        Set<WebSocketSession> set = rooms.get(meetingId);
        if (set != null) {
            set.remove(session);
            if (set.isEmpty()) rooms.remove(meetingId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String meetingId = getMeetingId(session);
        Set<WebSocketSession> set = rooms.get(meetingId);
        if (set != null) {
            for (WebSocketSession s : set) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(message);
                }
            }
        }
    }

    private String getMeetingId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("meetingId")) {
                    return kv[1];
                }
            }
        }
        return "default";
    }
} 