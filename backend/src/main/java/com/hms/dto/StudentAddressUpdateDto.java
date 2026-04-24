package com.hms.dto;

import lombok.Data;

@Data
public class StudentAddressUpdateDto {
    private String addressLine;
    private String city;
    private String state;
    private String country;
    private String pincode;
}
