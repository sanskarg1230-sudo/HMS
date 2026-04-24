package com.hms.repository;

import com.hms.model.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HostelRepository extends JpaRepository<Hostel, Long> {
    List<Hostel> findByWardenIdAndIsDeletedFalse(Long wardenId);
    Optional<Hostel> findByIdAndIsDeletedFalse(Long id);
}
