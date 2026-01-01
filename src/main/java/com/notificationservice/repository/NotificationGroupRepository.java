package com.notificationservice.repository;

import com.notificationservice.model.NotificationGroup;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface NotificationGroupRepository
        extends ReactiveMongoRepository<NotificationGroup,String> {
    Mono<NotificationGroup> findByUserIdAndConversationId(String userId, String conversationId);
    Flux<NotificationGroup> findTop50ByUserIdAndUnreadCountGreaterThanEqualOrderByLastMessageAtDesc(String userId, int unreadCount);
}
