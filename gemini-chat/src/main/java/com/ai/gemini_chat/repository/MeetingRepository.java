package com.ai.gemini_chat.repository;

import com.ai.gemini_chat.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, String> {
} 