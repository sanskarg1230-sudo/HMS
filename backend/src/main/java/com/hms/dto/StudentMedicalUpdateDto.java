package com.hms.dto;

import lombok.Data;

@Data
public class StudentMedicalUpdateDto {
    private String bloodGroup;
    private String allergies;
    private String medicalConditions;
    private String medications;
    private String doctorContact;
    private String notes;
}
