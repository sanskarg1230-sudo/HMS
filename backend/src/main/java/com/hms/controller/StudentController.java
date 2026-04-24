package com.hms.controller;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    // ── Room Info ──────────────────────────────────────────────────────────────
    @GetMapping("/api/student/room")
    public ResponseEntity<Map<String, Object>> getMyRoom(Principal principal) {
        return ResponseEntity.ok(studentService.getMyRoom(principal.getName()));
    }

    // ── Fees ───────────────────────────────────────────────────────────────────
    @GetMapping("/api/student/fees")
    public ResponseEntity<List<FeeRecord>> getMyFees(Principal principal) {
        return ResponseEntity.ok(studentService.getMyFees(principal.getName()));
    }

    // ── Complaints ─────────────────────────────────────────────────────────────
    @PostMapping("/api/student/complaints")
    public ResponseEntity<Complaint> submitComplaint(Principal principal, @RequestBody ComplaintDto dto) {
        return ResponseEntity.ok(studentService.submitComplaint(principal.getName(), dto));
    }

    @GetMapping("/api/student/complaints")
    public ResponseEntity<List<Complaint>> getMyComplaints(Principal principal) {
        return ResponseEntity.ok(studentService.getMyComplaints(principal.getName()));
    }

    // ── Notices ────────────────────────────────────────────────────────────────
    @GetMapping("/api/student/notices")
    public ResponseEntity<List<Notice>> getNotices(Principal principal) {
        return ResponseEntity.ok(studentService.getNotices(principal.getName()));
    }

    // ── Profile ────────────────────────────────────────────────────────────────
    @GetMapping("/api/student/profile")
    public ResponseEntity<User> getProfile(Principal principal) {
        return ResponseEntity.ok(studentService.getProfile(principal.getName()));
    }

    @PatchMapping("/api/student/profile")
    public ResponseEntity<User> updateProfile(Principal principal, @RequestBody UpdateProfileDto dto) {
        return ResponseEntity.ok(studentService.updateProfile(principal.getName(), dto));
    }

    @PatchMapping("/api/student/password")
    public ResponseEntity<Map<String, String>> changePassword(Principal principal, @RequestBody ChangePasswordDto dto) {
        studentService.changePassword(principal.getName(), dto);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
