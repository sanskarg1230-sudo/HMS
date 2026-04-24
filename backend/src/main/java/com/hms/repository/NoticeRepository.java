package com.hms.repository;

import com.hms.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByHostelIdOrderByIsPinnedDescCreatedAtDesc(Long hostelId);
}
