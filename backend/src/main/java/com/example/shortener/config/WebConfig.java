package com.example.shortener.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties app;

    public WebConfig(AppProperties app) {
        this.app = app;
    }

    /** Allow our frontend (and only our frontend) to call /api/** from the browser. */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(app.frontendOrigin())
                .allowedMethods("GET", "POST", "DELETE");
    }
}