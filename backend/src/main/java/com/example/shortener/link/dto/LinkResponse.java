package com.example.shortener.link.dto;

import com.example.shortener.link.Link;
import java.time.Instant;

public record LinkResponse(
        String code,
        String shortUrl,
        String longUrl,
        long clicks,
        Instant createdAt,
        Instant lastAccessedAt,
        Instant expiresAt) {

    public static LinkResponse from(Link link, String baseUrl) {
        return new LinkResponse(
                link.getCode(),
                baseUrl + "/r/" + link.getCode(),
                link.getLongUrl(),
                link.getClicks(),
                link.getCreatedAt(),
                link.getLastAccessedAt(),
                link.getExpiresAt());
    }
}
