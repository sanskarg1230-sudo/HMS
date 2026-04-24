package com.hms.repository;

import com.hms.model.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {
    List<BugReport> findAllByOrderByCreatedAtDesc();
}
