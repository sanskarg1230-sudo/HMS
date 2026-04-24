package com.hms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_medical")
public class StudentMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "allergies", length = 1000)
    private String allergies;

    @Column(name = "medical_conditions", length = 1000)
    private String medicalConditions;

    @Column(name = "medications", length = 1000)
    private String medications;

    @Column(name = "doctor_contact")
    private String doctorContact;

    @Column(name = "notes", length = 2000)
    private String notes;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
