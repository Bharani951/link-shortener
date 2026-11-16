package com.example.shortener.link;

import com.example.shortener.config.AppProperties;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;


/** All the rules about links. Knows nothing about HTTP. */
@Service
public class LinkService {

    private static final int MAX_ATTEMPTS = 5;

    private final LinkRepository repository;
    private final MongoTemplate mongoTemplate;
    private final CodeGenerator codeGenerator;
    private final AppProperties app;

    public LinkService(LinkRepository repository, MongoTemplate mongoTemplate,
                       CodeGenerator codeGenerator, AppProperties app) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
        this.codeGenerator = codeGenerator;
        this.app = app;
    }

    public Link create(String rawUrl, Integer expiresInDays) {
        URI url = parseAndCheck(rawUrl);
        Instant now = Instant.now();
        Instant expiresAt = (expiresInDays == null) ? null : now.plus(expiresInDays, ChronoUnit.DAYS);

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return repository.insert(new Link(codeGenerator.next(), url.toString(), now, expiresAt));
            } catch (DuplicateKeyException e) {
                // Two links got the same random code (very rare). Try again with a new code.
            }
        }
        throw new IllegalStateException("Could not create a unique code after " + MAX_ATTEMPTS + " attempts");
    }

    public Link resolve(String code) {
        Instant now = Instant.now();
        // Match the code AND (no expiry OR expiry still in the future)
        Query query = new Query(Criteria.where("code").is(code)
                .orOperator(
                        Criteria.where("expiresAt").is(null),  // matches null AND missing fields
                        Criteria.where("expiresAt").gt(now)));
        Update update = new Update()
                .inc("clicks", 1)
                .set("lastAccessedAt", now);

        Link link = mongoTemplate.findAndModify(
                query, update, FindAndModifyOptions.options().returnNew(true), Link.class);

        if (link == null) {
            throw new LinkNotFoundException(code);
        }
        return link;
    }

    public Link get(String code) {
        return repository.findByCode(code)
                .filter(link -> link.isActiveAt(Instant.now()))
                .orElseThrow(() -> new LinkNotFoundException(code));
    }

    public List<Link> list() {
        Instant now = Instant.now();
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(link -> link.isActiveAt(now))
                .toList();
    }

    public void delete(String code) {
        if (repository.deleteByCode(code) == 0) {
            throw new LinkNotFoundException(code);
        }
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
        String ownHost = URI.create(app.baseUrl()).getHost();
        if (url.getHost().equalsIgnoreCase(ownHost)) {
            throw new InvalidUrlException("You can't shorten a link that points to this shortener");
        }
        return url;
    }
}