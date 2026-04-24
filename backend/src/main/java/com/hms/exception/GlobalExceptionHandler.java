package com.hms.exception;

import com.hms.dto.LoginResponse;
import com.hms.security.SecurityAuditLogger;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler.
 * Catches exceptions from any controller and returns structured JSON responses
 * instead of crashing the server or returning a raw stack trace.
 *
 * All 403 and 5xx responses are also sent to the SecurityAuditLogger so they
 * appear in hms-security.log in production.
 */
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final SecurityAuditLogger auditLogger;

    // ── 401 — Invalid credentials ─────────────────────────────────────────────

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<LoginResponse> handleInvalidCredentials(
            InvalidCredentialsException ex, HttpServletRequest request) {
        // Login failures are already logged in AuthService with the email address
        LoginResponse response = new LoginResponse(ex.getMessage(), null, null);
        response.setError(true);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // ── 409 — Email already exists ────────────────────────────────────────────

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<LoginResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex, HttpServletRequest request) {
        LoginResponse response = new LoginResponse(ex.getMessage(), null, null);
        response.setError(true);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // ── 403 — Spring Security AccessDeniedException ───────────────────────────

    /**
     * Handles Spring Security's AccessDeniedException (e.g. from @PreAuthorize or
     * programmatic throw). Returns HTTP 403 with a generic message — never leaks
     * internal details.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<LoginResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        auditLogger.logUnauthorizedAccess(
                getPrincipal(), request.getMethod(), request.getRequestURI(), resolveIp(request));
        LoginResponse response = new LoginResponse(
                "Access denied. You do not have permission to perform this action.", null, null);
        response.setError(true);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // ── 403 / 500 — RuntimeException ──────────────────────────────────────────

    /**
     * Maps auth-related RuntimeExceptions (those whose message contains
     * "unauthorized" or "access denied") to HTTP 403.
     * All other RuntimeExceptions return HTTP 500.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<LoginResponse> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (msg.contains("unauthorized") || msg.contains("access denied")) {
            auditLogger.logUnauthorizedAccess(
                    getPrincipal(), request.getMethod(), request.getRequestURI(), resolveIp(request));
            LoginResponse response = new LoginResponse(
                    "Access denied. You do not have permission to perform this action.", null, null);
            response.setError(true);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        // Not an auth error — log as a server-side API error
        auditLogger.logApiError(
                request.getMethod(), request.getRequestURI(), 500,
                ex.getMessage(), resolveIp(request));
        ex.printStackTrace();
        LoginResponse response = new LoginResponse("Server Error: " + ex.getMessage(), null, null);
        response.setError(true);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ── 500 — Catch-all ───────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<LoginResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        auditLogger.logApiError(
                request.getMethod(), request.getRequestURI(), 500,
                ex.getMessage(), resolveIp(request));
        ex.printStackTrace();
        LoginResponse response = new LoginResponse("Server Error: " + ex.getMessage(), null, null);
        response.setError(true);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return realIp;
        return request.getRemoteAddr();
    }

    private String getPrincipal() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            return (auth != null && auth.getName() != null) ? auth.getName() : "anonymous";
        } catch (Exception e) {
            return "anonymous";
        }
    }
}
