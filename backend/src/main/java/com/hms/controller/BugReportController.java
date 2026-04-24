package com.hms.controller;

import com.hms.model.BugReport;
import com.hms.service.BugReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BugReportController {

    private final BugReportService bugReportService;

    /** AUTHENTICATED — admin or student can submit a bug report (multipart with optional screenshot) */
    @PostMapping(value = "/api/bugs/report", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Map<String, String>> submitBugReport(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "userEmail", required = false) String userEmail,
            @RequestParam("role") String role,
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
            @RequestParam(value = "pageUrl", required = false) String pageUrl,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot) {

        bugReportService.submitBugReport(userId, userName, userEmail, role, subject, description, pageUrl, screenshot);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Bug report submitted successfully. Thank you for helping us improve!"));
    }

    /** SUPER_ADMIN — get all bug reports */
    @GetMapping("/api/bugs")
    public ResponseEntity<List<BugReport>> getAllBugReports() {
        // Return reports without screenshot bytes (too heavy for list view)
        List<BugReport> reports = bugReportService.getAllBugReports();
        reports.forEach(r -> r.setScreenshot(null)); // strip binary from list response
        return ResponseEntity.ok(reports);
    }

    /** SUPER_ADMIN — update bug report status */
    @PutMapping("/api/bugs/{id}/status")
    public ResponseEntity<BugReport> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BugReport updated = bugReportService.updateStatus(id, body.get("status"));
        updated.setScreenshot(null); // strip binary
        return ResponseEntity.ok(updated);
    }

    /** SUPER_ADMIN — serve screenshot for a specific bug report */
    @GetMapping("/api/bugs/{id}/screenshot")
    public ResponseEntity<byte[]> getScreenshot(@PathVariable Long id) {
        BugReport report = bugReportService.getById(id);
        if (report.getScreenshot() == null || report.getScreenshot().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = report.getScreenshotContentType() != null
                ? report.getScreenshotContentType()
                : "image/png";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(report.getScreenshot());
    }
}
