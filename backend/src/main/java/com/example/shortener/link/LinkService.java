package com.example.shortener.link;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

/** All the rules about links. Knows nothing about HTTP. */
@Service
public class LinkService {

    private static final int MAX_ATTEMPTS = 5;

    private final LinkRepository repository;
    private final CodeGenerator codeGenerator;

    public LinkService(LinkRepository repository, CodeGenerator codeGenerator) {
        this.repository = repository;
        this.codeGenerator = codeGenerator;
    }

    public Link create(String rawUrl) {
        URI url = parseAndCheck(rawUrl);
        Instant now = Instant.now();

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return repository.insert(new Link(codeGenerator.next(), url.toString(), now));
            } catch (DuplicateKeyException e) {
                // Two links got the same random code (very rare). Try again with a new code.
            }
        }
        throw new IllegalStateException("Could not create a unique code after " + MAX_ATTEMPTS + " attempts");
    }

    private URI parseAndCheck(String rawUrl) {
        URI url;
        try {
            url = new URI(rawUrl.trim());
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("That is not a valid URL");
        }

        String scheme = url.getScheme();
        if (scheme == null) {
            throw new InvalidUrlException("Start the link with http:// or https://");
        }
        if (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https")) {
            throw new InvalidUrlException("Only http and https links are allowed");
        }
        if (url.getHost() == null || url.getHost().isBlank()) {
            throw new InvalidUrlException("The link needs a host, like example.com");
        }
        return url;
    }
}