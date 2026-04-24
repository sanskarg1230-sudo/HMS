package com.hms.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        sendHtmlEmail(to, subject, body);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
            
            helper.setFrom(fromEmail, "Hostel Management System");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            System.out.println(">>> Professional HTML Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println(">>> ERROR sending HTML email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage());
        }
    }

    private String wrapHtmlLayout(String title, String content, String buttonText, String buttonUrl) {
        return String.format(
            "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f7f6;margin:0;padding:40px;color:#333;}" +
            ".card{max-width:560px;margin:0 auto;background:#ffffff;padding:40px;border-radius:24px;shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;}" +
            ".header{text-align:center;margin-bottom:30px;}.header h1{color:#134e4a;margin:0;font-size:24px;font-weight:800;}" +
            ".body{font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:30px;}" +
            ".btn-container{text-align:center;margin-top:40px;}" +
            ".btn{background-color:#0d9488;color:#ffffff;padding:16px 32px;text-decoration:none;border-radius:14px;font-weight:700;font-size:16px;transition:background 0.3s;display:inline-block;}" +
            ".footer{text-align:center;margin-top:40px;font-size:12px;color:#9ca3af;padding-top:20px;border-top:1px solid #f1f5f9;}" +
            ".fallback{word-break:break-all;color:#0d9488;font-size:12px;margin-top:20px;}</style></head><body>" +
            "<div class='card'><div class='header'><h1>HMS Portal</h1></div>" +
            "<div class='body'>%s</div>" +
            "<div class='btn-container'><a href='%s' class='btn'>%s</a></div>" +
            "<div class='fallback'>If the button doesn't work, copy and paste this link:<br>%s</div>" +
            "<div class='footer'><b>Hostel Management System</b><br>This is an automated email. Please do not reply.</div>" +
            "</div></body></html>",
            content, buttonUrl, buttonText, buttonUrl
        );
    }

    public void sendInviteEmail(String to, String name, String hostelName, String activationLink) {
        String title = "Activate your " + hostelName + " Portal Account";
        String content = String.format(
            "Hello <strong>%s</strong>,<br><br>" +
            "You have been officially invited to join the <strong>%s</strong> Management Portal.<br><br>" +
            "As a student, you can now:<br>" +
            "• View and manage your room details<br>" +
            "• Track your hostel fee payments<br>" +
            "• Submit and track complaints<br>" +
            "• Access notices anytime<br><br>" +
            "To get started, please click the button below to set your secure password:",
            name, hostelName
        );
        String html = wrapHtmlLayout(title, content, "Activate Your Account", activationLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendAdminApprovalEmail(String to, String name, String hostelName, String loginLink) {
        String title = "Hostel Registration Approved!";
        String content = String.format(
            "Hello <strong>%s</strong>,<br><br>" +
            "Great news! Your request to manage <strong>%s</strong> on the HMS Portal has been approved.<br><br>" +
            "Your admin account is now active. You can start managing rooms, students, and notices immediately by logging in:",
            name, hostelName
        );
        String html = wrapHtmlLayout(title, content, "Login to Dashboard", loginLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        String title = "Reset your HMS Password";
        String content = String.format(
            "Hello <strong>%s</strong>,<br><br>" +
            "We received a request to reset your password. If you didn't make this request, you can safely ignore this email.<br><br>" +
            "To set a new password, click the button below (this link will expire in 30 minutes):",
            name
        );
        String html = wrapHtmlLayout(title, content, "Reset Password", resetLink);
        sendHtmlEmail(to, title, html);
    }

    public void sendContactConfirmationEmail(String to, String name, String subject) {
        String title = "We received your message — HMS Support";
        String content = String.format(
            "Hello <strong>%s</strong>,<br><br>" +
            "Thank you for reaching out to us! We have successfully received your message regarding: <strong>%s</strong>.<br><br>" +
            "Our support team will review your query and get back to you within 24–48 business hours.<br><br>" +
            "If your issue is urgent, please don't hesitate to call us directly at <strong>+1 (555) 000-HMS1</strong>.<br><br>" +
            "We appreciate your patience.",
            name, subject
        );
        String html = String.format(
            "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f7f6;margin:0;padding:40px;color:#333;}" +
            ".card{max-width:560px;margin:0 auto;background:#ffffff;padding:40px;border-radius:24px;border:1px solid #e2e8f0;}" +
            ".header{text-align:center;margin-bottom:30px;}.header h1{color:#134e4a;margin:0;font-size:24px;font-weight:800;}" +
            ".body{font-size:16px;line-height:1.6;color:#4b5563;margin-bottom:30px;}" +
            ".footer{text-align:center;margin-top:40px;font-size:12px;color:#9ca3af;padding-top:20px;border-top:1px solid #f1f5f9;}</style></head><body>" +
            "<div class='card'><div class='header'><h1>HMS Support</h1></div>" +
            "<div class='body'>%s</div>" +
            "<div class='footer'><b>Hostel Management System</b><br>This is an automated email. Please do not reply.</div>" +
            "</div></body></html>",
            content
        );
        sendHtmlEmail(to, title, html);
    }
}
