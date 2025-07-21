package com.ai.gemini_chat.controller;

import com.ai.gemini_chat.model.Meeting;
import com.ai.gemini_chat.model.Participant;
import com.ai.gemini_chat.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {
    @Autowired
    private MeetingService meetingService;

    @PostMapping
    public Meeting createMeeting(@RequestParam String name) {
        return meetingService.createMeeting(name);
    }

    @GetMapping("/{id}")
    public Optional<Meeting> getMeeting(@PathVariable String id) {
        return meetingService.getMeeting(id);
    }

    @PostMapping("/{id}/join")
    public Meeting joinMeeting(@PathVariable String id, @RequestParam String name) {
        return meetingService.joinMeeting(id, name);
    }

    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    public Meeting removeParticipant(@PathVariable String id, @PathVariable Long participantId) {
        return meetingService.removeParticipant(id, participantId);
    }
} 