package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hostel_id", nullable = false)
    private Long hostelId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String type; // "SINGLE" | "DOUBLE" | "TRIPLE"

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Boolean occupied = false;

    @Column(name = "occupant_count", nullable = false)
    private Integer occupantCount = 0;

    @Column(name = "is_ac", nullable = false)
    private Boolean isAC = false; // AC | Non-AC

    @Column(name = "assigned_student_id")
    private Long assignedStudentId;

    @Transient
    private List<String> occupantNames;
}
