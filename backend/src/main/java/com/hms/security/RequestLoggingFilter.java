package com.hms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Servlet filter that runs around every HTTP request.
 *
 * Responsibilities:
 *  1. Logs every request: method, path, HTTP status, duration, client IP.
 *  2. Tracks 401/403 responses per IP and fires a SUSPICIOUS log entry once
 *     an IP accumulates enough consecutive failures (brute-force detection).
 *  3. Warns on unusually slow responses (> 5 s) which can indicate DoS.
 *
 * This filter is registered automatically by Spring Boot via @Component.
 * It runs OUTSIDE the Spring Security filter chain so it always sees the
 * final committed HTTP status code.
 */
@Component
@Order(1)                 // run before everything else
@RequiredArgsConstructor
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger REQUEST_LOG = LoggerFactory.getLogger("HMS_REQUEST");

    private final SecurityAuditLogger auditLogger;

    // ── Brute-force detection config ─────────────────────────────────────────
    /** Number of failed-auth responses from one IP before we flag it suspicious. */
    private static final int BRUTE_FORCE_THRESHOLD = 10;
    /** After flagging, log again every N additional failures (avoids log spam). */
    private static final int BRUTE_FORCE_LOG_INTERVAL = 10;
    /** Slow-request threshold in milliseconds. */
    private static final long SLOW_REQUEST_MS = 5_000;

    /**
     * Per-IP failure counter.
     * Intentionally in-memory (no Redis dependency) — resets on restart.
     * Good enough to detect rapid attacks within a session.
     */
    private final ConcurrentHashMap<String, AtomicInteger> failedAuthAttempts =
            new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        long start = System.currentTimeMillis();
        String ip     = resolveClientIp(request);
        String method = request.getMethod();
        String path   = request.getRequestURI();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long ms     = System.currentTimeMillis() - start;
            int  status = response.getStatus();

            // 1. Log every request
            REQUEST_LOG.info("[REQUEST] {} {} -> {} ({}ms) ip={}", method, path, status, ms, ip);

            // 2. Track failed authentication responses for brute-force detection
            if (status == 401 || status == 403) {
                trackAuthFailure(ip, method, path);
            }

            // 3. Warn on slow responses
            if (ms > SLOW_REQUEST_MS) {
                auditLogger.logSuspiciousActivity(ip, "SLOW_REQUEST",
                        String.format("%s %s took %dms", method, path, ms));
            }
        }
    }

    // ── Brute-force helper ───────────────────────────────────────────────────

    private void trackAuthFailure(String ip, String method, String path) {
        int total = failedAuthAttempts
                .computeIfAbsent(ip, k -> new AtomicInteger(0))
                .incrementAndGet();

        if (total >= BRUTE_FORCE_THRESHOLD &&
                (total == BRUTE_FORCE_THRESHOLD || total % BRUTE_FORCE_LOG_INTERVAL == 0)) {
            auditLogger.logSuspiciousActivity(ip, "BRUTE_FORCE_DETECTED",
                    String.format("totalFailures=%d lastPath=%s %s", total, method, path));
        }
    }

    // ── IP resolution ────────────────────────────────────────────────────────

    /**
     * Respects X-Forwarded-For and X-Real-IP headers set by nginx/reverse-proxy.
     * Takes the leftmost (original client) address from a comma-separated list.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }
}
