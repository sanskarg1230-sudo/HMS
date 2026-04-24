package com.hms.repository;

import com.hms.model.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {
    List<StudentDocument> findByStudentIdOrderByUploadedAtDesc(Long studentId);
}
