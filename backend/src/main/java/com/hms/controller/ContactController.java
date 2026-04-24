package com.hms.controller;

import com.hms.dto.ContactMessageDto;
import com.hms.model.ContactMessage;
import com.hms.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /** PUBLIC — anyone can submit a contact form */
    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, String>> submitContact(@Valid @RequestBody ContactMessageDto dto) {
        contactService.submitMessage(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Your message has been sent successfully. Our team will contact you shortly."));
    }

    /** SUPER_ADMIN — view all contact messages */
    @GetMapping("/api/contact/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    /** SUPER_ADMIN — update message status */
    @PutMapping("/api/contact/{id}/status")
    public ResponseEntity<ContactMessage> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(contactService.updateStatus(id, status));
    }
}
