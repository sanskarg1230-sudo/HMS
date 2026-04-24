package com.hms.exception;

/**
 * Custom exception thrown when a registration attempt uses an email
 * that is already registered in the system.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
