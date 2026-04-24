package com.hms.repository;

import com.hms.model.StudentLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentLeaveRepository extends JpaRepository<StudentLeave, Long> {
    List<StudentLeave> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<StudentLeave> findByStudentIdAndStatusOrderByCreatedAtDesc(Long studentId, String status);
}
