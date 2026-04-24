package com.hms.repository;

import com.hms.model.MessMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessMenuRepository extends JpaRepository<MessMenu, Long> {
    Optional<MessMenu> findTopByHostelIdOrderByCreatedAtDesc(Long hostelId);
}
