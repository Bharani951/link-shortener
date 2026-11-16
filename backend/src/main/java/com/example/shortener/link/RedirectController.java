package com.example.shortener.link;

import java.net.URI;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** The public side of the shortener: /r/{code} sends the visitor on to the real URL. */
@RestController
public class RedirectController {

    private final LinkService linkService;

    public RedirectController(LinkService linkService) {
        this.linkService = linkService;
    }

    @GetMapping("/r/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        Link link = linkService.resolve(code);
        return ResponseEntity.status(HttpStatus.FOUND)             // 302: "it's over there, for now"
                .location(URI.create(link.getLongUrl()))           // the Location header
                .header(HttpHeaders.CACHE_CONTROL, "no-store")     // don't cache: every click must reach us
                .build();
    }
}