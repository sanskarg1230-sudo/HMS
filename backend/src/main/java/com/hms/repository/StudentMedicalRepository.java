package com.hms.repository;

import com.hms.model.StudentMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentMedicalRepository extends JpaRepository<StudentMedical, Long> {
    Optional<StudentMedical> findByStudentId(Long studentId);
}
