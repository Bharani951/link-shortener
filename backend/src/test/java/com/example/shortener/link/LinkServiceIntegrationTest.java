package com.example.shortener.link;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.shortener.TestcontainersConfiguration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

@SpringBootTest                                // start the whole application
@Import(TestcontainersConfiguration.class)     // ...connected to a fresh MongoDB in Docker
class LinkServiceIntegrationTest {

    @Autowired LinkService linkService;
    @Autowired LinkRepository repository;
    @Autowired MongoTemplate mongoTemplate;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll(); // every test starts from an empty collection
    }

    @Test
    void createsALinkThatCanBeResolved() {
        Link created = linkService.create("https://example.com/docs", null);

        Link resolved = linkService.resolve(created.getCode());

        assertThat(resolved.getLongUrl()).isEqualTo("https://example.com/docs");
        assertThat(resolved.getClicks()).isEqualTo(1);
    }

    @Test
    void rejectsDangerousSchemes() {
        assertThatThrownBy(() -> linkService.create("javascript:alert(1)", null))
                .isInstanceOf(InvalidUrlException.class);
    }

    @Test
    void countsEveryClickEvenWhenClicksHappenAtTheSameTime() throws Exception {
        Link link = linkService.create("https://example.com", null);
        int clicks = 50;

        List<Future<Link>> results = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(10)) { // 10 "users" clicking at once
            for (int i = 0; i < clicks; i++) {
                results.add(pool.submit(() -> linkService.resolve(link.getCode())));
            }
            for (Future<Link> result : results) {
                result.get(); // re-throws if any click failed
            }
        }

        assertThat(linkService.get(link.getCode()).getClicks()).isEqualTo(clicks);
    }

    @Test
    void expiredLinksStopWorkingImmediately() {
        Link link = linkService.create("https://example.com", 1);
        // Pretend a day has passed: move expiresAt into the past
        mongoTemplate.updateFirst(
                new Query(Criteria.where("code").is(link.getCode())),
                new Update().set("expiresAt", Instant.now().minusSeconds(60)),
                Link.class);

        assertThatThrownBy(() -> linkService.resolve(link.getCode()))
                .isInstanceOf(LinkNotFoundException.class);
    }
}