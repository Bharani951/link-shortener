package com.example.shortener.link;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/** Makes random 7-character codes from 62 characters: 62^7 ≈ 3.5 trillion possibilities. */
@Component
public class CodeGenerator {

    private static final String ALPHABET =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final int LENGTH = 7;

    // SecureRandom, not Random: codes must not be predictable (LEARNING.md §6.3)
    private final SecureRandom random = new SecureRandom();

    public String next() {
        StringBuilder code = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            code.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }
}