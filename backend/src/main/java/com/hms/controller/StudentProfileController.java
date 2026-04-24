package com.hms.controller;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import com.hms.repository.UserRepository;

@RestController
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService profileService;
    private final UserRepository userRepository;

    private Long resolveId(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // ── Full Profile ─────────────────────────────────────────────────────────

    @GetMapping("/api/student/full-profile")
    public ResponseEntity<StudentProfileDto> getMyFullProfile(Principal principal) {
        return ResponseEntity.ok(profileService.getFullProfile(resolveId(principal)));
    }

    // ── Update Sections ──────────────────────────────────────────────────────

    @PatchMapping("/api/student/profile/personal")
    public ResponseEntity<StudentProfile> updatePersonal(Principal principal,
                                                          @RequestBody StudentProfileUpdateDto dto) {
        return ResponseEntity.ok(profileService.updatePersonal(resolveId(principal), dto));
    }

    @PatchMapping("/api/student/profile/parents")
    public ResponseEntity<StudentParents> updateParents(Principal principal,
                                                         @RequestBody StudentParentsUpdateDto dto) {
        return ResponseEntity.ok(profileService.updateParents(resolveId(principal), dto));
    }

    @PatchMapping("/api/student/profile/address")
    public ResponseEntity<StudentAddress> updateAddress(Principal principal,
                                                         @RequestBody StudentAddressUpdateDto dto) {
        return ResponseEntity.ok(profileService.updateAddress(resolveId(principal), dto));
    }

    @PatchMapping("/api/student/profile/medical")
    public ResponseEntity<StudentMedical> updateMedical(Principal principal,
                                                         @RequestBody StudentMedicalUpdateDto dto) {
        return ResponseEntity.ok(profileService.updateMedical(resolveId(principal), dto));
    }

    // ── Leave ────────────────────────────────────────────────────────────────

    @GetMapping("/api/student/leave")
    public ResponseEntity<List<StudentLeave>> getMyLeave(Principal principal) {
        return ResponseEntity.ok(profileService.getLeaveHistory(resolveId(principal)));
    }

    @PostMapping("/api/student/leave/request")
    public ResponseEntity<StudentLeave> requestLeave(Principal principal,
                                                      @RequestBody StudentLeaveRequestDto dto) {
        return ResponseEntity.ok(profileService.requestLeave(resolveId(principal), dto));
    }

    // ── Documents ────────────────────────────────────────────────────────────

    @GetMapping("/api/student/documents")
    public ResponseEntity<List<StudentDocument>> getMyDocuments(Principal principal) {
        return ResponseEntity.ok(profileService.getDocuments(resolveId(principal)));
    }

    @PostMapping("/api/student/documents/upload")
    public ResponseEntity<StudentDocument> uploadDocument(
            Principal principal,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(profileService.uploadDocument(resolveId(principal), documentType, file));
    }

    @GetMapping("/api/student/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(Principal principal,
                                                      @PathVariable Long id) {
        StudentDocument doc = profileService.getDocument(id);
        // Security: ensure the document belongs to this student
        Long myId = resolveId(principal);
        if (!doc.getStudentId().equals(myId)) {
            return ResponseEntity.status(403).build();
        }
        Resource resource = profileService.loadDocumentAsResource(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }
}
