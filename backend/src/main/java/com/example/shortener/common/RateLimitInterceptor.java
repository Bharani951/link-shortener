package com.example.shortener.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Lets each IP address create at most 10 links per minute ("fixed window" rate limiting).
 * Learning version: counts live in this server's memory, so they reset on restart and
 * aren't shared between servers. Production apps use Redis or a library such as Bucket4j.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_CREATES_PER_MINUTE = 10;

    private record Window(long minute, AtomicInteger count) {}

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return true; // only creating links is limited
        }

        long currentMinute = System.currentTimeMillis() / 60_000;
        Window window = windows.compute(request.getRemoteAddr(), (ip, existing) ->
                (existing == null || existing.minute() != currentMinute)
                        ? new Window(currentMinute, new AtomicInteger())
                        : existing);

        if (window.count().incrementAndGet() <= MAX_CREATES_PER_MINUTE) {
            return true; // under the limit: let the request continue to the controller
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, "60");
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.getWriter().write("""
                {"title":"Too many requests","status":429,"detail":"You can create %d links per minute. Try again shortly."}"""
                .formatted(MAX_CREATES_PER_MINUTE));
        return false; // stop here: the controller never runs
    }
}