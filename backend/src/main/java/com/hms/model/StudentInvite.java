package com.hms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_invites")
public class StudentInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(name = "hostel_id", nullable = false)
    private Long hostelId;

    @Column(name = "room_id")
    private Long roomId; // Optional room assignment

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING | ACTIVATED | EXPIRED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
