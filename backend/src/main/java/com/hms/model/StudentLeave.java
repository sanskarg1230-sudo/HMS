package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_leave")
public class StudentLeave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "from_date", nullable = false)
    private String fromDate;

    @Column(name = "to_date", nullable = false)
    private String toDate;

    @Column(name = "reason", length = 1000)
    private String reason;

    /**
     * Status: PENDING (student submitted, awaiting admin decision)
     *         APPROVED (admin approved)
     *         REJECTED (admin rejected)
     */
    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    /** Name of the admin who actioned this leave request */
    @Column(name = "actioned_by")
    private String actionedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
