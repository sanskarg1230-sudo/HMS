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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "role", nullable = false)
    private String role; // "super_admin" | "admin" | "student"

    @Column(name = "management_type")
    private String managementType = "SINGLE"; // "SINGLE" | "MULTI"

    @Column(name = "hostel_id")
    private Long hostelId; // Links student to a hostel OR acts as default for Single Admin

    @Column(name = "room_id")
    private Long roomId; // Links student to a specific room

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
