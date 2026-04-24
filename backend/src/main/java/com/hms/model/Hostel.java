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
@Table(name = "hostels")
public class Hostel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hostel_name", nullable = false)
    private String hostelName;

    @Column(name = "university_name")
    private String universityName;

    @Column
    private String address;

    @Column(name = "room_count")
    private Integer roomCount;

    @Column(name = "warden_phone")
    private String wardenPhone;

    @Column(name = "warden_email")
    private String wardenEmail;

    @Column(name = "warden_id")
    private Long wardenId; // Link to User (Role: Admin)

    @Column(name = "hostel_type")
    private String hostelType; // BOYS | GIRLS | MIXED

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false; // Soft-delete logic

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
