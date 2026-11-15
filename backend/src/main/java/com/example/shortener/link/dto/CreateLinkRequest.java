package com.example.shortener.link.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** What the frontend sends to create a link. The annotations are checked before our code runs. */
public record CreateLinkRequest(
        @NotBlank(message = "Paste a URL to shorten")
        @Size(max = 2048, message = "The URL must be at most 2048 characters")
        String url) {
}