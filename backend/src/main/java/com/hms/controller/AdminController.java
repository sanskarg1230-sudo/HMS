package com.hms.controller;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final StudentInviteService inviteService;
    private final com.hms.service.StudentProfileService studentProfileService;
    private final com.hms.repository.UserRepository userRepository;

    // ── Hostels ───────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/hostels")
    public ResponseEntity<List<Hostel>> getHostels(Principal principal) {
        return ResponseEntity.ok(adminService.getHostels(principal.getName()));
    }

    @DeleteMapping("/api/admin/hostels/{id}")
    public ResponseEntity<Map<String, String>> deleteHostel(Principal principal, @PathVariable Long id) {
        adminService.softDeleteHostel(principal.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Hostel soft-deleted successfully"));
    }

    // ── Rooms ──────────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/rooms")
    public ResponseEntity<List<Room>> getRooms(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getRooms(principal.getName(), hostelId));
    }

    @PostMapping("/api/admin/rooms")
    public ResponseEntity<Room> addRoom(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @RequestBody RoomDto dto) {
        return ResponseEntity.ok(adminService.addRoom(principal.getName(), hostelId, dto));
    }

    @DeleteMapping("/api/admin/rooms/{id}")
    public ResponseEntity<Map<String, String>> deleteRoom(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        adminService.deleteRoom(principal.getName(), hostelId, id);
        return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
    }

    @PostMapping("/api/admin/rooms/{roomId}/assign/{studentId}")
    public ResponseEntity<Map<String, String>> assignRoom(Principal principal,
                                                          @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId,
                                                          @PathVariable Long roomId,
                                                          @PathVariable Long studentId) {
        adminService.assignRoom(principal.getName(), hostelId, studentId, roomId);
        return ResponseEntity.ok(Map.of("message", "Room assigned successfully"));
    }

    // ── Students ───────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/students")
    public ResponseEntity<List<User>> getStudents(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getStudents(principal.getName(), hostelId));
    }

    @DeleteMapping("/api/admin/students/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        adminService.deleteStudent(principal.getName(), hostelId, id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // ── Fees ───────────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/fees")
    public ResponseEntity<List<FeeRecord>> getFees(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getFees(principal.getName(), hostelId));
    }

    @PostMapping("/api/admin/fees")
    public ResponseEntity<FeeRecord> addFeeRecord(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @RequestBody FeeDto dto) {
        return ResponseEntity.ok(adminService.addFeeRecord(principal.getName(), hostelId, dto));
    }

    @PostMapping("/api/admin/fees/{id}/mark-paid")
    public ResponseEntity<FeeRecord> markFeePaid(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.markFeePaid(principal.getName(), hostelId, id));
    }

    // ── Complaints ─────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/complaints")
    public ResponseEntity<List<Complaint>> getComplaints(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getComplaints(principal.getName(), hostelId));
    }

    @PostMapping("/api/admin/complaints/{id}/resolve")
    public ResponseEntity<Complaint> resolveComplaint(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.resolveComplaint(principal.getName(), hostelId, id));
    }

    // ── Notices ────────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/notices")
    public ResponseEntity<List<Notice>> getNotices(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getNotices(principal.getName(), hostelId));
    }

    @PostMapping("/api/admin/notices")
    public ResponseEntity<Notice> createNotice(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @RequestBody NoticeDto dto) {
        return ResponseEntity.ok(adminService.createNotice(principal.getName(), hostelId, dto));
    }

    @PutMapping("/api/admin/notices/{id}")
    public ResponseEntity<Notice> updateNotice(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id, @RequestBody NoticeDto dto) {
        return ResponseEntity.ok(adminService.updateNotice(principal.getName(), hostelId, id, dto));
    }

    @DeleteMapping("/api/admin/notices/{id}")
    public ResponseEntity<Map<String, String>> deleteNotice(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        adminService.deleteNotice(principal.getName(), hostelId, id);
        return ResponseEntity.ok(Map.of("message", "Notice deleted"));
    }

    // ── Audit Logs ─────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/logs")
    public ResponseEntity<List<AuditLog>> getLogs(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getLogs(principal.getName(), hostelId));
    }

    // ── Hostel Info ────────────────────────────────────────────────────────────
    @GetMapping("/api/admin/hostel")
    public ResponseEntity<Hostel> getHostelInfo(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(adminService.getHostelInfo(principal.getName(), hostelId));
    }

    @PutMapping("/api/admin/hostel")
    public ResponseEntity<Hostel> updateHostelInfo(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @RequestBody UpdateHostelDto dto) {
        return ResponseEntity.ok(adminService.updateHostelInfo(principal.getName(), hostelId, dto));
    }

    // ── Student Invitations ───────────────────────────────────────────────────

    @PostMapping("/api/admin/students/invite")
    public ResponseEntity<Map<String, String>> inviteStudent(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @RequestBody InviteRequest request) {
        inviteService.inviteStudent(principal.getName(), hostelId, request);
        return ResponseEntity.ok(Map.of("message", "Invitation sent successfully to " + request.getEmail()));
    }

    @GetMapping("/api/admin/students/invites")
    public ResponseEntity<List<StudentInvite>> getPendingInvites(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId) {
        return ResponseEntity.ok(inviteService.getPendingInvites(principal.getName(), hostelId));
    }

    @DeleteMapping("/api/admin/students/invites/{id}")
    public ResponseEntity<Map<String, String>> cancelInvite(Principal principal, @RequestHeader(value = "X-Hostel-Id", required = false) Long hostelId, @PathVariable Long id) {
        inviteService.cancelInvite(principal.getName(), hostelId, id);
        return ResponseEntity.ok(Map.of("message", "Invitation cancelled successfully"));
    }

    // ── Student Profile (Admin View) ──────────────────────────────────────────

    @GetMapping("/api/admin/students/{id}/profile")
    public ResponseEntity<com.hms.dto.StudentProfileDto> getStudentProfile(
            Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(studentProfileService.getFullProfile(id));
    }

    // ── Student Leave Management ──────────────────────────────────────────────

    @GetMapping("/api/admin/students/{id}/leave")
    public ResponseEntity<java.util.List<com.hms.model.StudentLeave>> getStudentLeave(
            Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(studentProfileService.getLeaveHistory(id));
    }

    @PostMapping("/api/admin/students/{id}/leave")
    public ResponseEntity<com.hms.model.StudentLeave> addLeaveRecord(
            Principal principal, @PathVariable Long id,
            @RequestBody com.hms.dto.StudentLeaveRequestDto dto) {
        String adminName = userRepository.findByEmail(principal.getName())
                .map(u -> u.getName()).orElse(principal.getName());
        return ResponseEntity.ok(studentProfileService.addLeaveRecord(id, dto, adminName));
    }

    @PutMapping("/api/admin/leave/{leaveId}/approve")
    public ResponseEntity<com.hms.model.StudentLeave> approveLeave(
            Principal principal, @PathVariable Long leaveId,
            @RequestBody(required = false) Map<String, String> body) {
        String adminName = userRepository.findByEmail(principal.getName())
                .map(u -> u.getName()).orElse(principal.getName());
        String note = body != null ? body.getOrDefault("adminNote", null) : null;
        return ResponseEntity.ok(studentProfileService.actionLeave(leaveId, "APPROVED", note, adminName));
    }

    @PutMapping("/api/admin/leave/{leaveId}/reject")
    public ResponseEntity<com.hms.model.StudentLeave> rejectLeave(
            Principal principal, @PathVariable Long leaveId,
            @RequestBody(required = false) Map<String, String> body) {
        String adminName = userRepository.findByEmail(principal.getName())
                .map(u -> u.getName()).orElse(principal.getName());
        String note = body != null ? body.getOrDefault("adminNote", null) : null;
        return ResponseEntity.ok(studentProfileService.actionLeave(leaveId, "REJECTED", note, adminName));
    }

    // ── Student Document Management ───────────────────────────────────────────

    @GetMapping("/api/admin/students/{id}/documents")
    public ResponseEntity<java.util.List<com.hms.model.StudentDocument>> getStudentDocuments(
            Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(studentProfileService.getDocuments(id));
    }

    @PutMapping("/api/admin/documents/{docId}/verify")
    public ResponseEntity<com.hms.model.StudentDocument> verifyDocument(
            Principal principal, @PathVariable Long docId) {
        String adminName = userRepository.findByEmail(principal.getName())
                .map(u -> u.getName()).orElse(principal.getName());
        return ResponseEntity.ok(studentProfileService.verifyDocument(docId, adminName));
    }

    @PutMapping("/api/admin/documents/{docId}/reject")
    public ResponseEntity<com.hms.model.StudentDocument> rejectDocument(
            Principal principal, @PathVariable Long docId,
            @RequestBody(required = false) Map<String, String> body) {
        String adminName = userRepository.findByEmail(principal.getName())
                .map(u -> u.getName()).orElse(principal.getName());
        String note = body != null ? body.getOrDefault("adminNote", "") : "";
        return ResponseEntity.ok(studentProfileService.rejectDocument(docId, adminName, note));
    }

    @GetMapping("/api/admin/documents/{docId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(
            Principal principal, @PathVariable Long docId) {
        com.hms.model.StudentDocument doc = studentProfileService.getDocument(docId);
        org.springframework.core.io.Resource resource = studentProfileService.loadDocumentAsResource(docId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(
                        doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    // ── Admin: Edit Student Medical Record ────────────────────────────────────

    @PatchMapping("/api/admin/students/{id}/medical")
    public ResponseEntity<com.hms.model.StudentMedical> updateStudentMedical(
            Principal principal, @PathVariable Long id,
            @RequestBody com.hms.dto.StudentMedicalUpdateDto dto) {
        return ResponseEntity.ok(studentProfileService.updateMedical(id, dto));
    }
}
