package com.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MessageReadEvent {
    private String conversationId;
    private String readerId;
    private Long readAt;
}
