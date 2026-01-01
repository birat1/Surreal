package com.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MessageCreatedEvent {
    private String messageId;
    private String conversationId;
    private String senderId;
    private String senderUsername;
    private String recipientId;
    private String preview;
    private long timeStamp;
}
