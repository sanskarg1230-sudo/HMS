package com.hms.exception;

/**
 * Custom exception thrown when email or password is invalid.
 * Extends RuntimeException so it doesn't need to be declared in method signatures.
 * Caught by GlobalExceptionHandler to return a clean 401 response.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
