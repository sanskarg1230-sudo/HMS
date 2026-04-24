package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_documents")
public class StudentDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    /**
     * Document types: ID_PROOF, ADMISSION_LETTER, MEDICAL_CERTIFICATE,
     *                  POLICE_VERIFICATION, PASSPORT_PHOTO, OTHER
     */
    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "stored_filename")
    private String storedFilename;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    /**
     * Status: PENDING (just uploaded), VERIFIED (admin confirmed), REJECTED (admin rejected)
     */
    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}
