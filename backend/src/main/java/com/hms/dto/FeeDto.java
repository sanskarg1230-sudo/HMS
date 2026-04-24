package com.hms.dto;

import lombok.Data;

@Data
public class FeeDto {
    private Long studentId;
    private String studentName;
    private Double amount;
    private String month;
    private Integer year;
    private String currency;
}
