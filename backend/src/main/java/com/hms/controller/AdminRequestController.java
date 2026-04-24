package com.hms.controller;

import com.hms.dto.AdminRequestDto;
import com.hms.model.AdminRequest;
import com.hms.service.AdminRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminRequestController {

    private final AdminRequestService adminRequestService;

    /** PUBLIC — Anyone on the landing page can submit a request */
    @PostMapping("/api/admin-request")
    public ResponseEntity<Map<String, String>> submitRequest(@Valid @RequestBody AdminRequestDto dto) {
        adminRequestService.submitRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Your request has been submitted successfully. Our team will review and grant admin access."));
    }

    /** SUPER_ADMIN — View all requests */
    @GetMapping("/api/admin-requests")
    public ResponseEntity<List<AdminRequest>> getAllRequests() {
        return ResponseEntity.ok(adminRequestService.getAllRequests());
    }

    /** SUPER_ADMIN — Approve a request */
    @PostMapping("/api/admin-requests/{id}/approve")
    public ResponseEntity<AdminRequest> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(adminRequestService.approveRequest(id));
    }

    /** SUPER_ADMIN — Reject a request */
    @PostMapping("/api/admin-requests/{id}/reject")
    public ResponseEntity<AdminRequest> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(adminRequestService.rejectRequest(id));
    }
}
