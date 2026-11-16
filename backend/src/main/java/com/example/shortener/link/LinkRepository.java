package com.example.shortener.link;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LinkRepository extends MongoRepository<Link, String> {

    List<Link> findAllByOrderByCreatedAtDesc();   // → find all, sort by createdAt descending

    long deleteByCode(String code);    
    Optional<Link> findByCode(String code);           // → delete where code = ?, returns how many were deleted
}