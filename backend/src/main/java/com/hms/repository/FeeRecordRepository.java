package com.hms.repository;

import com.hms.model.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {
    List<FeeRecord> findByHostelIdOrderByYearDescCreatedAtDesc(Long hostelId);
    List<FeeRecord> findByStudentIdOrderByYearDescCreatedAtDesc(Long studentId);
}
