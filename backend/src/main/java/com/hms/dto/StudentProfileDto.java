package com.hms.dto;

import com.hms.model.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class StudentProfileDto {

    // ── Base (from users table) ──────────────────────────────────────────────
    private Long id;
    private String name;
    private String email;
    private Long hostelId;
    private Long roomId;
    private LocalDateTime createdAt;

    // ── Extended personal info ───────────────────────────────────────────────
    private String phone;
    private String university;
    private String course;
    private String year;
    private String joinDate;

    // ── Parents ───────────────────────────────────────────────────────────────
    private String fatherName;
    private String motherName;
    private String guardianName;
    private String parentPhone;
    private String parentEmail;
    private String emergencyContact;

    // ── Address ───────────────────────────────────────────────────────────────
    private String addressLine;
    private String city;
    private String state;
    private String country;
    private String pincode;

    // ── Medical ───────────────────────────────────────────────────────────────
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String medications;
    private String doctorContact;
    private String medicalNotes;

    // ── Completion ────────────────────────────────────────────────────────────
    private Map<String, Boolean> completionSections;
    private int completionPercent;

    // ── Room & Hostel names (resolved by service) ─────────────────────────────
    private String roomNumber;
    private String hostelName;

    // ── Static helpers to assemble DTO from entities ──────────────────────────

    public static StudentProfileDto from(
            User user,
            StudentProfile profile,
            StudentParents parents,
            StudentAddress address,
            StudentMedical medical,
            String roomNumber,
            String hostelName
    ) {
        StudentProfileDto dto = new StudentProfileDto();

        // Base
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.hostelId = user.getHostelId();
        dto.roomId = user.getRoomId();
        dto.createdAt = user.getCreatedAt();
        dto.roomNumber = roomNumber;
        dto.hostelName = hostelName;

        // Personal
        if (profile != null) {
            dto.phone = profile.getPhone();
            dto.university = profile.getUniversity();
            dto.course = profile.getCourse();
            dto.year = profile.getYear();
            dto.joinDate = profile.getJoinDate();
        }

        // Parents
        if (parents != null) {
            dto.fatherName = parents.getFatherName();
            dto.motherName = parents.getMotherName();
            dto.guardianName = parents.getGuardianName();
            dto.parentPhone = parents.getParentPhone();
            dto.parentEmail = parents.getParentEmail();
            dto.emergencyContact = parents.getEmergencyContact();
        }

        // Address
        if (address != null) {
            dto.addressLine = address.getAddressLine();
            dto.city = address.getCity();
            dto.state = address.getState();
            dto.country = address.getCountry();
            dto.pincode = address.getPincode();
        }

        // Medical
        if (medical != null) {
            dto.bloodGroup = medical.getBloodGroup();
            dto.allergies = medical.getAllergies();
            dto.medicalConditions = medical.getMedicalConditions();
            dto.medications = medical.getMedications();
            dto.doctorContact = medical.getDoctorContact();
            dto.medicalNotes = medical.getNotes();
        }

        // Completion
        boolean hasPersonal = profile != null && profile.getPhone() != null && profile.getUniversity() != null;
        boolean hasParents  = parents != null && parents.getFatherName() != null;
        boolean hasAddress  = address != null && address.getCity() != null;
        boolean hasMedical  = medical != null && medical.getBloodGroup() != null;

        dto.completionSections = Map.of(
            "basic",   true,
            "personal", hasPersonal,
            "parents",  hasParents,
            "address",  hasAddress,
            "medical",  hasMedical
        );

        int done = 1 + (hasPersonal ? 1 : 0) + (hasParents ? 1 : 0) + (hasAddress ? 1 : 0) + (hasMedical ? 1 : 0);
        dto.completionPercent = (done * 100) / 5;

        return dto;
    }
}
