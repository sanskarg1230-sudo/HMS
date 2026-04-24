package com.hms.repository;

import com.hms.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByHostelIdOrderByCreatedAtDesc(Long hostelId);
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
