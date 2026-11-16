package com.example.shortener.link;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CodeGeneratorTest {

    private final CodeGenerator generator = new CodeGenerator();

    @Test
    void generatesSevenCharacterBase62Codes() {
        assertThat(generator.next()).matches("[0-9A-Za-z]{7}");
    }

    @Test
    void generatesDifferentCodesEachTime() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 10_000; i++) {
            codes.add(generator.next());
        }
        assertThat(codes).hasSize(10_000); // a duplicate here is possible but astronomically unlikely
    }
}