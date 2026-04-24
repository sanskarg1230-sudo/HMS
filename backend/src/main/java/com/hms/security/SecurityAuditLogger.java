package com.hms.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Central security audit logger.
 *
 * Uses four named SLF4J loggers that map to separate log files in production
 * (see logback-spring.xml):
 *   HMS_AUTH     → authentication events (login success/failure)
 *   HMS_SECURITY → suspicious activity, invalid tokens, unauthorized access
 *   HMS_API      → API errors (4xx / 5xx)
 *   HMS_REQUEST  → per-request timing (written by RequestLoggingFilter)
 *
 * All log lines are prefixed with a bracketed tag so they are trivially
 * grep-able:  grep '\[AUTH_FAILURE\]' logs/hms-security.log
 */
@Component
public class SecurityAuditLogger {

    private static final Logger AUTH_LOG     = LoggerFactory.getLogger("HMS_AUTH");
    private static final Logger SECURITY_LOG = LoggerFactory.getLogger("HMS_SECURITY");
    private static final Logger API_LOG      = LoggerFactory.getLogger("HMS_API");

    // ── Authentication ───────────────────────────────────────────────────────

    public void logLoginSuccess(String email, String role, String ip) {
        AUTH_LOG.info("[AUTH_SUCCESS] email={} role={} ip={}", email, role, ip);
    }

    public void logLoginFailure(String email, String ip, String reason) {
        AUTH_LOG.warn("[AUTH_FAILURE] email={} ip={} reason={}", email, ip, reason);
    }

    // ── Token / JWT ──────────────────────────────────────────────────────────

    public void logInvalidToken(String ip, String reason) {
        SECURITY_LOG.warn("[INVALID_TOKEN] ip={} reason={}", ip, reason);
    }

    // ── Suspicious / anomalous behaviour ────────────────────────────────────

    /**
     * Called when repeated auth failures are detected from a single IP address.
     */
    public void logSuspiciousActivity(String ip, String reason, String details) {
        SECURITY_LOG.warn("[SUSPICIOUS] ip={} reason={} details={}", ip, reason, details);
    }

    /**
     * Called when a service throws an Unauthorized / access-denied error.
     */
    public void logUnauthorizedAccess(String principal, String method, String path, String ip) {
        SECURITY_LOG.warn("[UNAUTHORIZED_ACCESS] principal={} method={} path={} ip={}",
                principal, method, path, ip);
    }

    // ── API Errors ───────────────────────────────────────────────────────────

    public void logApiError(String method, String path, int status, String error, String ip) {
        API_LOG.error("[API_ERROR] method={} path={} status={} error={} ip={}",
                method, path, status, error, ip);
    }
}
