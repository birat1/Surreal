package com.notificationservice.util;

import org.springframework.http.HttpCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class JwtCookieResolver {

    private static final String COOKIE_NAME = "access_token";

    public String resolve(ServerHttpRequest request) {
        HttpCookie cookie = request.getCookies().getFirst(COOKIE_NAME);
        return cookie != null ? cookie.getValue() : null;
    }
}
