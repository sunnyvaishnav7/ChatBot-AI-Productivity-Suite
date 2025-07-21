package com.ai.gemini_chat.service;

import com.ai.gemini_chat.model.Meeting;
import com.ai.gemini_chat.model.Participant;
import com.ai.gemini_chat.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MeetingService {
    @Autowired
    private MeetingRepository meetingRepository;

    public Meeting createMeeting(String creatorName) {
        String id = "MEET-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Participant creator = Participant.builder()
                .name(creatorName)
                .isVideoOn(true)
                .isMicOn(true)
                .handRaised(false)
                .connection("green")
                .build();
        Meeting meeting = Meeting.builder()
                .id(id)
                .createdAt(LocalDateTime.now())
                .build();
        meeting.getParticipants().add(creator);
        return meetingRepository.save(meeting);
    }

    public Optional<Meeting> getMeeting(String id) {
        return meetingRepository.findById(id);
    }

    public Meeting joinMeeting(String meetingId, String name) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        Participant participant = Participant.builder()
                .name(name)
                .isVideoOn(true)
                .isMicOn(true)
                .handRaised(false)
                .connection("green")
                .build();
        meeting.getParticipants().add(participant);
        return meetingRepository.save(meeting);
    }

    public Meeting addParticipant(String meetingId, Participant participant) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        meeting.getParticipants().add(participant);
        return meetingRepository.save(meeting);
    }

    public Meeting removeParticipant(String meetingId, Long participantId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        meeting.getParticipants().removeIf(p -> p.getId().equals(participantId));
        return meetingRepository.save(meeting);
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }
} 