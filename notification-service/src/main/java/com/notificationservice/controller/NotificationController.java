package com.notificationservice.controller;

import com.notificationservice.model.NotificationGroup;
import com.notificationservice.service.NotificationService;
import com.notificationservice.service.SseEmitterService;
import com.notificationservice.util.JwtCookieResolver;
import com.notificationservice.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/")
@AllArgsConstructor
public class NotificationController {

    private final SseEmitterService sseEmitterService;
    private final NotificationService notificationService;
    private final JwtCookieResolver jwtCookieResolver;
    private final JwtUtil jwtUtil;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<NotificationGroup>> stream(ServerHttpRequest request) {
        String token = jwtCookieResolver.resolve(request);
        String userId = jwtUtil.extractUserId(token);

        System.out.println("Connected to userId = " + userId);

        return sseEmitterService.subscribe(userId);
    }

    @GetMapping("/notifications/unread")
    public Flux<NotificationGroup> getUnreadNotificationGroups(ServerHttpRequest request) {
        String token = jwtCookieResolver.resolve(request);
        String userId = jwtUtil.extractUserId(token);

        return notificationService.getUnreadNotificationGroups(userId);
    }

    @PatchMapping("/notifications/mark-read")
    public Mono<ResponseEntity<Long>> markAllRead(ServerHttpRequest request) {
        String token = jwtCookieResolver.resolve(request);
        String userId = jwtUtil.extractUserId(token);

        return notificationService.markAllRead(userId)
                .map(ResponseEntity::ok);
    }

    @PatchMapping("notifications/{notificationGroupId}/mark-read")
    public Mono<ResponseEntity<Boolean>> markOneRead(
            ServerHttpRequest request,
            @PathVariable String notificationGroupId
    ) {
        String token = jwtCookieResolver.resolve(request);
        String userId = jwtUtil.extractUserId(token);

        return notificationService.markOneRead(userId, notificationGroupId)
                .map(ResponseEntity::ok);
    }

}
