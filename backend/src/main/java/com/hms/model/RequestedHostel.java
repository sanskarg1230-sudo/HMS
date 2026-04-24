package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "requested_hostels")
public class RequestedHostel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_request_id")
    private AdminRequest adminRequest;

    @Column(name = "hostel_name", nullable = false)
    private String hostelName;

    @Column(name = "hostel_type")
    private String hostelType; // BOYS | GIRLS | MIXED

    @Column(name = "total_rooms")
    private Integer totalRooms;
}
