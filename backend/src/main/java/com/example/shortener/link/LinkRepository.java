package com.example.shortener.link;

import org.springframework.data.mongodb.repository.MongoRepository;

/** Spring Data writes the implementation for us at startup. */
public interface LinkRepository extends MongoRepository<Link, String> {
}