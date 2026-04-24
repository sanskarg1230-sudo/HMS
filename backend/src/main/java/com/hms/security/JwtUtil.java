package com.hms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility for generating and validating JWT tokens.
 * Tokens contain: email (subject) + role (claim).
 * Expiry: 24 hours.
 *
 * The signing secret is read from the HMS_JWT_SECRET environment variable
 * (via the hms.jwt.secret property). A local dev default is set in
 * application.properties. Production MUST override with a strong random key.
 */
@Component
public class JwtUtil {

    @Value("${hms.jwt.secret}")
    private String jwtSecret;

    private static final long EXPIRY_MS = 24L * 60 * 60 * 1000; // 24 hours

    /**
     * Validate the secret key length at startup so misconfiguration is caught
     * immediately rather than at the first request.
     */
    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "[HMS] JWT secret is too short (minimum 32 chars). " +
                "Set the HMS_JWT_SECRET environment variable."
            );
        }
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate a signed JWT token with email and role claims.
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract the email (subject) from a token.
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extract the role from a token.
     */
    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    /**
     * Validate that the token is well-formed and not expired.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Returns the failure reason for a token — used by JwtAuthFilter for audit logging.
     */
    public String getValidationError(String token) {
        try {
            parseClaims(token);
            return null; // valid
        } catch (ExpiredJwtException e) {
            return "TOKEN_EXPIRED";
        } catch (JwtException e) {
            return "TOKEN_INVALID: " + e.getMessage();
        } catch (IllegalArgumentException e) {
            return "TOKEN_MALFORMED";
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
