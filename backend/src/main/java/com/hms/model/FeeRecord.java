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
@Table(name = "fee_records")
public class FeeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "hostel_id", nullable = false)
    private Long hostelId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String month; // e.g. "March"

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String status = "UNPAID"; // PAID | UNPAID

    @Column(nullable = false)
    private String currency = "INR"; // Default INR

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
