package com.notificationservice.listener;

import com.notificationservice.dto.ChatEvent;
import com.notificationservice.dto.MessageCreatedEvent;
import com.notificationservice.dto.MessageReadEvent;
import com.notificationservice.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;


import static com.notificationservice.config.RabbitMqConfig.CHAT_QUEUE;

@Slf4j
@Component
@AllArgsConstructor
public class ChatMessageListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = CHAT_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    public void receiveMessage(ChatEvent event) {

            switch (event.getEventType()) {
                case "MessageCreated" -> {
                    MessageCreatedEvent payload = event.getMessageCreated();
                    if (payload == null) {
                        log.warn("messageCreated field is null");
                        return;
                    }
                    notificationService.processMessageCreated(payload)
                            .onErrorResume(e -> {
                                log.error(
                                        "Failed to process MessageRead event with conversationId: {}",
                                        payload.getConversationId(),
                                        e
                                );
                                return Mono.empty();
                            })
                            .block();
                }

                case "MessageRead" -> {
                    MessageReadEvent payload = event.getMessageRead();
                    if (payload == null) {
                        log.warn("messageRead field is null");
                        return;
                    }
                    notificationService.processMessageRead(payload)
                            .onErrorResume(e -> {
                                log.error(
                                        "Failed to process MessageRead event with conversationId: {}",
                                        payload.getConversationId(),
                                        e
                                );
                                return Mono.empty();
                            })
                            .block();
                }

                default -> {
                    log.warn("Unknown chat event type: {}", event.getEventType());
                }
            }
    }
}

