package com.hms.repository;

import com.hms.model.StudentParents;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentParentsRepository extends JpaRepository<StudentParents, Long> {
    Optional<StudentParents> findByStudentId(Long studentId);
}
