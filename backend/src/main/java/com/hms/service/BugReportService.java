package com.hms.service;

import com.hms.model.BugReport;
import com.hms.repository.BugReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BugReportService {

    private final BugReportRepository bugReportRepository;

    public BugReport submitBugReport(
            Long userId,
            String userName,
            String userEmail,
            String role,
            String subject,
            String description,
            String pageUrl,
            MultipartFile screenshot
    ) {
        BugReport report = new BugReport();
        report.setUserId(userId);
        report.setUserName(userName);
        report.setUserEmail(userEmail);
        report.setRole(role);
        report.setSubject(subject);
        report.setDescription(description);
        report.setPageUrl(pageUrl);
        report.setStatus("new");

        if (screenshot != null && !screenshot.isEmpty()) {
            try {
                report.setScreenshot(screenshot.getBytes());
                report.setScreenshotContentType(screenshot.getContentType());
            } catch (IOException e) {
                System.err.println(">>> WARNING: Could not read screenshot bytes: " + e.getMessage());
            }
        }

        return bugReportRepository.save(report);
    }

    public List<BugReport> getAllBugReports() {
        return bugReportRepository.findAllByOrderByCreatedAtDesc();
    }

    public BugReport updateStatus(Long id, String status) {
        BugReport report = bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug report not found with id: " + id));

        List<String> validStatuses = List.of("new", "in_progress", "resolved");
        if (!validStatuses.contains(status)) {
            throw new RuntimeException("Invalid status. Must be one of: new, in_progress, resolved");
        }

        report.setStatus(status);
        return bugReportRepository.save(report);
    }

    public BugReport getById(Long id) {
        return bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug report not found with id: " + id));
    }
}
