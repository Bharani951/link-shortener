package com.example.shortener.common;

import com.example.shortener.link.InvalidUrlException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.example.shortener.link.LinkNotFoundException;

/** Turns exceptions thrown anywhere into clean JSON error responses. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidUrlException.class)
    public ProblemDetail handleInvalidUrl(InvalidUrlException e) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
        problem.setTitle("Invalid URL");
        return problem;
    }

    /** Thrown when @Valid finds a problem in the request body (e.g. empty url). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Some fields are invalid");
        problem.setTitle("Validation failed");
        problem.setProperty("errors", errors);
        return problem;
    }
    /** Thrown when a link is not found. */
    @ExceptionHandler(LinkNotFoundException.class)
    public ProblemDetail handleNotFound(LinkNotFoundException e) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        problem.setTitle("Link not found");
        return problem;
    }
}