package com.notificationservice.service;

import com.mongodb.client.result.UpdateResult;
import com.notificationservice.dto.MessageCreatedEvent;
import com.notificationservice.dto.MessageReadEvent;
import com.notificationservice.model.NotificationGroup;
import com.notificationservice.repository.NotificationGroupRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@AllArgsConstructor
public class NotificationService {

    private final ReactiveMongoTemplate mongoTemplate;
    private final NotificationGroupRepository notificationGroupRepository;
    private final SseEmitterService sseEmitterService;

    public Mono<Void> processMessageCreated(MessageCreatedEvent event) {
        return notificationGroupRepository
                .findByUserIdAndConversationId(event.getRecipientId(), event.getConversationId())
                .flatMap(group -> {
                    group.setUnreadCount(group.getUnreadCount() + 1);
                    group.setLastMessagePreview(event.getPreview());
                    group.setLastMessageAt(event.getTimeStamp());
                    return notificationGroupRepository.save(group);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    NotificationGroup newGroup = NotificationGroup.builder()
                            .userId(event.getRecipientId())
                            .senderId(event.getSenderId())
                            .senderUsername(event.getSenderUsername())
                            .conversationId(event.getConversationId())
                            .unreadCount(1)
                            .lastMessagePreview(event.getPreview())
                            .lastMessageAt(event.getTimeStamp())
                            .build();
                    return notificationGroupRepository.save(newGroup);
                }))
                .doOnSuccess(sseEmitterService::sendToUser)
                .then();


    }

    public Mono<Void> processMessageRead(MessageReadEvent event) {
        return notificationGroupRepository
                .findByUserIdAndConversationId(event.getReaderId(), event.getConversationId())
                .switchIfEmpty(
                    Mono.fromRunnable(() ->
                        log.warn(
                                "No notification group found for conversation: {}, reader: {}",
                                event.getConversationId(),
                                event.getReaderId()
                        )
                    )
                )
                .flatMap(group -> {
                    group.setUnreadCount(0);
                    return notificationGroupRepository.save(group)
                            .doOnSuccess(sseEmitterService::sendToUser);
                })
                .then();

    }

    public Flux<NotificationGroup> getUnreadNotificationGroups(String userId){
        return notificationGroupRepository.findTop50ByUserIdAndUnreadCountGreaterThanEqualOrderByLastMessageAtDesc(userId, 1);
    }

    public Mono<Long> markAllRead(String userId) {
        Query query =  Query.query(Criteria.where("userId").is(userId).and("unreadCount").gte(1));
        Update update = new Update().set("unreadCount", 0);

        return mongoTemplate
                .updateMulti(query, update, NotificationGroup.class)
                .map(UpdateResult :: getModifiedCount);
    }

    public Mono<Boolean> markOneRead(String userId, String notificationGroupId) {
        Query query = Query.query(Criteria.where("_id").is(notificationGroupId)
                .and("userId").is(userId)
                .and("unreadCount").gte(1)
        );
        Update update = new Update().set("unreadCount", 0);

        return mongoTemplate
                .updateFirst(query, update, NotificationGroup.class)
                .map(result -> result.getModifiedCount() == 1);
    }
}
