package com.hms.controller;

import com.hms.dto.LoginRequest;
import com.hms.dto.LoginResponse;
import com.hms.service.AuthService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints.
 * All exceptions are handled by GlobalExceptionHandler — no try/catch needed here.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Accepts: { "email": "...", "password": "..." }
     * Returns: { "message": "Login successful", "role": "admin|student" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ── Invitation Activation ─────────────────────────────────────────────────
    private final com.hms.service.StudentInviteService inviteService;

    @GetMapping("/invite/validate/{token}")
    public ResponseEntity<com.hms.model.StudentInvite> validateToken(@PathVariable String token) {
        return ResponseEntity.ok(inviteService.validateToken(token));
    }

    @PostMapping("/activate")
    public ResponseEntity<Map<String, String>> activate(@RequestBody com.hms.dto.ActivationRequest request) {
        inviteService.activateAccount(request);
        return ResponseEntity.ok(Map.of("message", "Account activated successfully. You can now login."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "If an account exists with this email, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now login with your new password."));
    }
}
