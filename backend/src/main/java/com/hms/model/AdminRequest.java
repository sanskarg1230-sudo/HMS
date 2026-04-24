package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admin_requests")
public class AdminRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "management_type")
    private String managementType = "SINGLE"; // "SINGLE" | "MULTI"

    // ── SINGLE mode convenience fields (nullable — MULTI mode doesn't use them) ─
    @Column(name = "hostel_name")
    private String hostelName;

    @Column(name = "hostel_type")
    private String hostelType; // BOYS | GIRLS | MIXED

    @Column(name = "total_rooms")
    private Integer totalRooms;

    // ── Common fields ──────────────────────────────────────────────────────────
    @Column(name = "university_name")
    private String universityName;

    @Column(name = "warden_name", nullable = false)
    private String wardenName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String phone;

    @Column
    private String address;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING | APPROVED | REJECTED

    @OneToMany(mappedBy = "adminRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestedHostel> requestedHostels = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
