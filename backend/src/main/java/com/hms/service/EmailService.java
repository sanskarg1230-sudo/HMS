package com.hms.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Email service using the Brevo (Sendinblue) Transactional Email HTTP API.
 * Sends via HTTPS (port 443) — never blocked by PaaS providers like Render.
 *
 * Requires env var: BREVO_API_KEY
 * Optional env var: HMS_SENDER_EMAIL (defaults to noreply.support.hms@gmail.com)
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${hms.sender.email:noreply.support.hms@gmail.com}")
    private String senderEmail;

    @Value("${hms.sender.name:Hostel Management System}")
    private String senderName;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    @PostConstruct
    public void checkMailConfig() {
        log.info("========== MAIL CONFIGURATION CHECK (Brevo HTTP API) ==========");
        log.info("[MAIL] Brevo API Key = {}", brevoApiKey != null && brevoApiKey.length() > 10
                ? brevoApiKey.substring(0, 8) + "***" : "⚠ MISSING/TOO_SHORT");
        log.info("[MAIL] Sender = {} <{}>", senderName, senderEmail);
        log.info("[MAIL] Transport = HTTPS (port 443, no SMTP)");
        log.info("================================================================");
    }

    // ── Core send method (Brevo HTTP API) ────────────────────────────────────

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("[MAIL] Sending email via Brevo API to={}, subject={}", to, subject);

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.error("[MAIL] ❌ BREVO_API_KEY is not set! Cannot send email.");
            throw new RuntimeException("Email not configured: BREVO_API_KEY env var is missing.");
        }

        // Build the Brevo API request body
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        try {
            long start = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.exchange(
                    BREVO_API_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );
            long elapsed = System.currentTimeMillis() - start;

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[MAIL] ✅ Email sent successfully to {} (took {}ms) — response: {}",
                        to, elapsed, response.getBody());
            } else {
                log.error("[MAIL] ❌ Brevo returned non-2xx: {} — body: {}",
                        response.getStatusCode(), response.getBody());
                throw new RuntimeException("Brevo API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[MAIL] ❌ FAILED to send email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email via Brevo: " + e.getMessage());
        }
    }

    public void sendEmail(String to, String subject, String body) {
        sendHtmlEmail(to, subject, body);
    }

    // ── HTML email templates ─────────────────────────────────────────────────

    private String wrapHtmlLayout(String title, String content, String buttonText, String buttonUrl) {
        return String.format(
                "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                        + "<style>body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f7f6;margin:0;padding:40px;color:#333;}"
                        + ".card{max-width:560px;margin:0 auto;background:#ffffff;padding:40px;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;}"
                        + ".header{text-align:center;margin-bottom:30px;}.header h1{color:#134e4a;margin:0;font-size:24px;font-weight:800;}"
                        + ".body{font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:30px;}"
                        + ".btn-container{text-align:center;margin-top:40px;}"
                        + ".btn{background-color:#0d9488;color:#ffffff;padding:16px 32px;text-decoration:none;border-radius:14px;font-weight:700;font-size:16px;transition:background 0.3s;display:inline-block;}"
                        + ".footer{text-align:center;margin-top:40px;font-size:12px;color:#9ca3af;padding-top:20px;border-top:1px solid #f1f5f9;}"
                        + ".fallback{word-break:break-all;color:#0d9488;font-size:12px;margin-top:20px;}</style></head><body>"
                        + "<div class='card'><div class='header'><h1>HMS Portal</h1></div>"
                        + "<div class='body'>%s</div>"
                        + "<div class='btn-container'><a href='%s' class='btn'>%s</a></div>"
                        + "<div class='fallback'>If the button doesn't work, copy and paste this link:<br>%s</div>"
                        + "<div class='footer'><b>Hostel Management System</b><br>This is an automated email. Please do not reply.</div>"
                        + "</div></body></html>",
                content, buttonUrl, buttonText, buttonUrl);
    }

    public void sendInviteEmail(String to, String name, String hostelName, String activationLink) {
        String title = "Activate your " + hostelName + " Portal Account";
        String content = String.format(
                "Hello <strong>%s</strong>,<br><br>"
                        + "You have been officially invited to join the <strong>%s</strong> Management Portal.<br><br>"
                        + "As a student, you can now:<br>"
                        + "• View and manage your room details<br>"
                        + "• Track your hostel fee payments<br>"
                        + "• Submit and track complaints<br>"
                        + "• Access notices anytime<br><br>"
                        + "To get started, please click the button below to set your secure password:",
                name, hostelName);
        String html = wrapHtmlLayout(title, content, "Activate Your Account", activationLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendAdminApprovalEmail(String to, String name, String hostelName, String loginLink) {
        String title = "Hostel Registration Approved!";
        String content = String.format(
                "Hello <strong>%s</strong>,<br><br>"
                        + "Great news! Your request to manage <strong>%s</strong> on the HMS Portal has been approved.<br><br>"
                        + "Your admin account is now active. You can start managing rooms, students, and notices immediately by logging in:",
                name, hostelName);
        String html = wrapHtmlLayout(title, content, "Login to Dashboard", loginLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        String title = "Reset your HMS Password";
        String content = String.format(
                "Hello <strong>%s</strong>,<br><br>"
                        + "We received a request to reset your password. If you didn't make this request, you can safely ignore this email.<br><br>"
                        + "To set a new password, click the button below (this link will expire in 30 minutes):",
                name);
        String html = wrapHtmlLayout(title, content, "Reset Password", resetLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendContactConfirmationEmail(String to, String name, String subject) {
        String title = "We received your message — HMS Support";
        String content = String.format(
                "Hello <strong>%s</strong>,<br><br>"
                        + "Thank you for reaching out to us! We have successfully received your message regarding: <strong>%s</strong>.<br><br>"
                        + "Our support team will review your query and get back to you within 24–48 business hours.<br><br>"
                        + "If your issue is urgent, please don't hesitate to call us directly at <strong>+1 (555) 000-HMS1</strong>.<br><br>"
                        + "We appreciate your patience.",
                name, subject);
        String html = String.format(
                "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                        + "<style>body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f7f6;margin:0;padding:40px;color:#333;}"
                        + ".card{max-width:560px;margin:0 auto;background:#ffffff;padding:40px;border-radius:24px;border:1px solid #e2e8f0;}"
                        + ".header{text-align:center;margin-bottom:30px;}.header h1{color:#134e4a;margin:0;font-size:24px;font-weight:800;}"
                        + ".body{font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:30px;}"
                        + ".footer{text-align:center;margin-top:40px;font-size:12px;color:#9ca3af;padding-top:20px;border-top:1px solid #f1f5f9;}</style></head><body>"
                        + "<div class='card'><div class='header'><h1>HMS Support</h1></div>"
                        + "<div class='body'>%s</div>"
                        + "<div class='footer'><b>Hostel Management System</b><br>This is an automated email. Please do not reply.</div>"
                        + "</div></body></html>",
                content);
        sendHtmlEmail(to, title, html);
    }
}
