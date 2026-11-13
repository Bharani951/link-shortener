package com.example.shortener.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Our own settings from application.properties (everything starting with "app."). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String baseUrl, String frontendOrigin) {
}