package com.example.shortener.link;

import com.example.shortener.config.AppProperties;
import com.example.shortener.link.dto.CreateLinkRequest;
import com.example.shortener.link.dto.LinkResponse;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Turns HTTP requests into service calls, and results into HTTP responses. No business rules here. */
@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;
    private final AppProperties app;

    public LinkController(LinkService linkService, AppProperties app) {
        this.linkService = linkService;
        this.app = app;
    }

    @PostMapping
    public ResponseEntity<LinkResponse> create(@Valid @RequestBody CreateLinkRequest request) {
        Link link = linkService.create(request.url());
        return ResponseEntity
                .created(URI.create("/api/links/" + link.getCode())) // 201 + Location header
                .body(toResponse(link));
    }

    private LinkResponse toResponse(Link link) {
        return LinkResponse.from(link, app.baseUrl());
    }
}