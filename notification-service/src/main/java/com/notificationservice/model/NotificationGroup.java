package com.notificationservice.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_groups")
@Data
@Builder
public class NotificationGroup {
    @Id
    private String id;
    private String senderId;
    private String senderUsername;
    private String userId;
    private String conversationId;
    private int unreadCount;
    private String lastMessagePreview;
    private long lastMessageAt;
}
