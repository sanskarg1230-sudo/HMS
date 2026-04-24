package com.hms.repository;

import com.hms.model.StudentInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentInviteRepository extends JpaRepository<StudentInvite, Long> {
    Optional<StudentInvite> findByToken(String token);
    List<StudentInvite> findByHostelIdOrderByCreatedAtDesc(Long hostelId);
    Optional<StudentInvite> findByEmailAndStatus(String email, String status);
}
