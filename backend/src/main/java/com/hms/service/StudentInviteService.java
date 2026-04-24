package com.hms.service;

import com.hms.dto.ActivationRequest;
import com.hms.dto.InviteRequest;
import com.hms.model.Hostel;
import com.hms.model.StudentInvite;
import com.hms.model.User;
import com.hms.repository.HostelRepository;
import com.hms.repository.StudentInviteRepository;
import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentInviteService {

    private final StudentInviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final com.hms.repository.AuditLogRepository auditLogRepository;

    @Value("${hms.frontend.url}")
    private String frontendUrl;

    public void inviteStudent(String adminEmail, Long headerHostelId, InviteRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists.");
        }

        // Resolve hostelId: prefer explicit value from request body (for MULTI admins
        // selecting a specific hostel), then fall back to the header, then admin's own hostelId.
        Long hostelId = resolveHostelId(admin, headerHostelId, request.getHostelId());

        // Remove any existing pending invite for this email
        inviteRepository.findByEmailAndStatus(request.getEmail(), "PENDING")
                .ifPresent(inviteRepository::delete);

        String token = UUID.randomUUID().toString();
        StudentInvite invite = new StudentInvite();
        invite.setName(request.getName());
        invite.setEmail(request.getEmail());
        invite.setHostelId(hostelId);
        invite.setRoomId(request.getRoomId());
        invite.setToken(token);
        invite.setStatus("PENDING");
        invite.setExpiresAt(LocalDateTime.now().plusHours(48));

        inviteRepository.save(invite);
        auditLogRepository.save(new com.hms.model.AuditLog(hostelId, "ADMIN", "STUDENT_INVITED",
                "Sent invitation to " + request.getName() + " (" + request.getEmail() + ")"));

        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));

        String activationLink = String.format("%s/invite/%s", frontendUrl, token);
        emailService.sendInviteEmail(request.getEmail(), request.getName(), hostel.getHostelName(), activationLink);
    }

    /**
     * Resolve the hostel to associate the student with.
     * Priority: explicit body hostelId > X-Hostel-Id header > admin.hostelId
     */
    private Long resolveHostelId(User admin, Long headerHostelId, Long bodyHostelId) {
        if (bodyHostelId != null) return bodyHostelId;
        if (headerHostelId != null) return headerHostelId;
        if (admin.getHostelId() != null) return admin.getHostelId();
        throw new RuntimeException("Hostel context required but not found. Please select a hostel.");
    }

    public List<StudentInvite> getPendingInvites(String adminEmail, Long hostelId) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        // IDOR check: verify the admin owns the hostel they are querying
        boolean ownsHostel = hostelRepository.findByWardenIdAndIsDeletedFalse(admin.getId())
                .stream().anyMatch(h -> h.getId().equals(hostelId));
        if (!ownsHostel) {
            throw new RuntimeException("Unauthorized: you do not own this hostel");
        }
        return inviteRepository.findByHostelIdOrderByCreatedAtDesc(hostelId);
    }

    public StudentInvite validateToken(String token) {
        System.out.println("[DEBUG] Validating Token: [" + token + "]");

        long count = inviteRepository.count();
        System.out.println("[DEBUG] Total invites in DB: " + count);

        StudentInvite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> {
                    System.err.println("[ERROR] Token not found in database: [" + token + "]");
                    return new RuntimeException("Invalid invitation token.");
                });

        if (!"PENDING".equals(invite.getStatus())) {
            throw new RuntimeException("This invitation has already been used.");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus("EXPIRED");
            inviteRepository.save(invite);
            throw new RuntimeException("This invitation has expired.");
        }

        return invite;
    }

    @Transactional
    public void activateAccount(ActivationRequest request) {
        StudentInvite invite = validateToken(request.getToken());

        User user = new User();
        user.setName(invite.getName());
        user.setEmail(invite.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("student");
        user.setHostelId(invite.getHostelId());
        user.setRoomId(invite.getRoomId());

        userRepository.save(user);

        invite.setStatus("ACTIVATED");
        inviteRepository.save(invite);
    }

    public void cancelInvite(String adminEmail, Long hostelId, Long inviteId) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        StudentInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (!invite.getHostelId().equals(hostelId)) {
            throw new RuntimeException("Unauthorized to cancel this invite.");
        }

        inviteRepository.delete(invite);
    }
}
