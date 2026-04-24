package com.hms.service;

import com.hms.dto.ContactMessageDto;
import com.hms.model.ContactMessage;
import com.hms.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    public ContactMessage submitMessage(ContactMessageDto dto) {
        ContactMessage msg = new ContactMessage();
        msg.setName(dto.getName());
        msg.setEmail(dto.getEmail());
        msg.setSubject(dto.getSubject());
        msg.setMessage(dto.getMessage());
        msg.setStatus("new");
        ContactMessage saved = contactMessageRepository.save(msg);

        // Send confirmation email (non-blocking — log failure silently)
        try {
            emailService.sendContactConfirmationEmail(dto.getEmail(), dto.getName(), dto.getSubject());
        } catch (Exception e) {
            System.err.println(">>> WARNING: Could not send contact confirmation email: " + e.getMessage());
        }

        return saved;
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    public ContactMessage updateStatus(Long id, String status) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found with id: " + id));

        List<String> validStatuses = List.of("new", "read", "resolved");
        if (!validStatuses.contains(status)) {
            throw new RuntimeException("Invalid status. Must be one of: new, read, resolved");
        }

        msg.setStatus(status);
        return contactMessageRepository.save(msg);
    }
}
