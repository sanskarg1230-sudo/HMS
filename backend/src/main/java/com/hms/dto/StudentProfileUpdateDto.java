package com.hms.dto;

import lombok.Data;

@Data
public class StudentProfileUpdateDto {
    private String phone;
    private String university;
    private String course;
    private String year;
    private String joinDate;
}
