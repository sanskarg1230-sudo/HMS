package com.hms.dto;

import lombok.Data;

@Data
public class StudentParentsUpdateDto {
    private String fatherName;
    private String motherName;
    private String guardianName;
    private String parentPhone;
    private String parentEmail;
    private String emergencyContact;
}
