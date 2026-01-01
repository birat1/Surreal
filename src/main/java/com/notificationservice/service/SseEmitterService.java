package com.notificationservice.service;

import com.mongodb.internal.connection.Server;
import com.notificationservice.model.NotificationGroup;
import lombok.Getter;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Getter
public class SseEmitterService {

    private final Map<String, Sinks.Many<NotificationGroup>> userSinks = new ConcurrentHashMap<>();

    public Flux<ServerSentEvent<NotificationGroup>> subscribe(String userId) {

        Sinks.Many<NotificationGroup> sink = userSinks.computeIfAbsent(
                userId, key -> Sinks.many().multicast().onBackpressureBuffer(50, false)
        );

        Flux<ServerSentEvent<NotificationGroup>> sinkEvents = sink.asFlux()
                .map(notificationGroup -> ServerSentEvent.<NotificationGroup>builder()
                        .data(notificationGroup)
                        .build());

        Flux<ServerSentEvent<NotificationGroup>> heartbeat = Flux.interval(Duration.ofSeconds(30))
                .map(tick -> ServerSentEvent.<NotificationGroup>builder()
                        .comment("heartbeat")
                        .build());

        return sinkEvents
                .mergeWith(heartbeat)
                .doFinally(signalType -> cleanupSink(userId));
    }

    public void sendToUser(NotificationGroup group) {
        Sinks.Many<NotificationGroup> sink = userSinks.get(group.getUserId());

        if (sink != null) {
            Sinks.EmitResult result = sink.tryEmitNext(group);
            if (result.isFailure()) {
                cleanupSink(group.getUserId());
            }
        }
    }

    private void cleanupSink(String userId) {
        Sinks.Many<NotificationGroup>  sink = userSinks.get(userId);
        if (sink != null && sink.currentSubscriberCount() == 0) {
            userSinks.remove(userId);
            System.out.println("Cleaned up sink for: " + userId);
        }
    }

}
