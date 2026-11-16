package com.example.shortener.link;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** One short link, stored as one document in the "links" collection. */
@Document("links")
public class Link {

    @Id
    private String id;

    @Indexed(unique = true) // MongoDB itself refuses two links with the same code
    private String code;

    private String longUrl;
    private long clicks;
    private Instant createdAt;
    private Instant lastAccessedAt;

    @Indexed(expireAfter = "0s") // TTL index: MongoDB deletes the document once this time has passed
    private Instant expiresAt;   // null = never expires

    protected Link() {
        // Spring Data uses this when it reads a document back from MongoDB
    }

    public Link(String code, String longUrl, Instant createdAt, Instant expiresAt) {
        this.code = code;
        this.longUrl = longUrl;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    /** True if the link still works at this moment. */
    public boolean isActiveAt(Instant moment) {
        return expiresAt == null || expiresAt.isAfter(moment);
    }

    public String getId() { return id; }
    public String getCode() { return code; }
    public String getLongUrl() { return longUrl; }
    public long getClicks() { return clicks; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastAccessedAt() { return lastAccessedAt; }
    public Instant getExpiresAt() { return expiresAt; }
}