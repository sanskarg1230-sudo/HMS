package com.hms.repository;

import com.hms.model.StudentAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentAddressRepository extends JpaRepository<StudentAddress, Long> {
    Optional<StudentAddress> findByStudentId(Long studentId);
}
