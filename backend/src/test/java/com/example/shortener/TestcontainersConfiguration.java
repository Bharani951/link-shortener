package com.example.shortener;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mongodb.MongoDBContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Starts a throwaway MongoDB in Docker for the tests, and points Spring Boot at it.
 * Tests use it with @Import(TestcontainersConfiguration.class).
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    @ServiceConnection // Spring Boot reads the container's address itself: no spring.mongodb.uri needed
    MongoDBContainer mongoDbContainer() {
        return new MongoDBContainer(DockerImageName.parse("mongo:8.2")); // same version as compose.yaml
    }
}