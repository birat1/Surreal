package com.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatEvent {
    private String eventType;
    private MessageCreatedEvent messageCreated;
    private MessageReadEvent messageRead;
}
