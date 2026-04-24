package com.hms.dto;

import lombok.Data;

@Data
public class StudentLeaveRequestDto {
    private String fromDate;
    private String toDate;
    private String reason;
    // For admin action responses
    private String adminNote;
}
