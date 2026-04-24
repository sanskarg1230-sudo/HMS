package com.hms.dto;

import lombok.Data;

@Data
public class UpdateHostelDto {
    private String hostelName;
    private String universityName;
    private String address;
    private String wardenPhone;
    private String wardenEmail;
}
