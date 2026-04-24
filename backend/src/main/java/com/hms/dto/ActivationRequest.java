package com.hms.dto;

import lombok.Data;

@Data
public class ActivationRequest {
    private String token;
    private String password;
}
