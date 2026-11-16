package com.example.shortener.link.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLinkRequest(
        @NotBlank(message = "Paste a URL to shorten")
        @Size(max = 2048, message = "The URL must be at most 2048 characters")
        String url,

        @Min(value = 1, message = "Expiry must be at least 1 day")
        @Max(value = 365, message = "Expiry can be at most 365 days")
        Integer expiresInDays) { // Integer, not int: it may be null (= never)
}