package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@lombok.NoArgsConstructor
public class LoginResponse {
    private String message;
    private String role;
    private String token;
    private boolean error;

    public LoginResponse(String message, String role, String token) {
        this.message = message;
        this.role = role;
        this.token = token;
        this.error = false;
    }
}
