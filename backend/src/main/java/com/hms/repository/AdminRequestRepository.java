package com.hms.repository;

import com.hms.model.AdminRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {
    Optional<AdminRequest> findByEmail(String email);
}
