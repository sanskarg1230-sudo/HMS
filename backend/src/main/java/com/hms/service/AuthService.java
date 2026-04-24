package com.hms.service;

import com.hms.dto.LoginRequest;
import com.hms.dto.LoginResponse;
import com.hms.model.PasswordResetToken;
import com.hms.model.User;
import com.hms.repository.HostelRepository;
import com.hms.repository.PasswordResetTokenRepository;
import com.hms.repository.UserRepository;
import com.hms.security.JwtUtil;
import com.hms.security.SecurityAuditLogger;
import com.hms.exception.InvalidCredentialsException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecurityAuditLogger auditLogger;

    @Value("${hms.frontend.url}")
    private String hmsFrontendUrl;

    @PostConstruct
    public void seedAdmin() {
        if (userRepository.findByEmail("super@hms.com").isEmpty()) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("super@hms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("super_admin");
            userRepository.save(admin);
        }
        
        if (userRepository.findByEmail("admin@hms.com").isEmpty()) {
            User admin = new User();
            admin.setName("Test Admin");
            admin.setEmail("admin@hms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("admin");
            
            hostelRepository.findAll().stream().findFirst().ifPresentOrElse(
                h -> admin.setHostelId(h.getId()),
                () -> admin.setHostelId(1L)
            );
            
            userRepository.save(admin);
        }
    }

    public LoginResponse login(LoginRequest request) {
        String clientIp = resolveClientIp();

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            auditLogger.logLoginFailure(request.getEmail(), clientIp, "USER_NOT_FOUND");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            auditLogger.logLoginFailure(request.getEmail(), clientIp, "WRONG_PASSWORD");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        auditLogger.logLoginSuccess(user.getEmail(), user.getRole(), clientIp);
        return new LoginResponse("Login successful", user.getRole(), token);
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.deleteByUser(user);
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, user, 30);
            tokenRepository.save(resetToken);

            String resetLink = hmsFrontendUrl + "/reset-password/" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    /**
     * Resolves the client IP from the current HTTP request context.
     * Handles X-Forwarded-For (nginx) and X-Real-IP headers.
     */
    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "unknown";
            HttpServletRequest req = attrs.getRequest();
            String forwarded = req.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
            String realIp = req.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) return realIp;
            return req.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
