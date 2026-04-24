package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class AdminRequestDto {

    private String managementType = "SINGLE"; // "SINGLE" | "MULTI"

    // ── SINGLE mode convenience fields ─────────────────────────────────────────
    // Not @NotBlank — MULTI mode submits hostels via requestedHostels list instead
    private String hostelName;

    private String hostelType; // BOYS | GIRLS | MIXED

    private Integer totalRooms;

    // ── Common fields ──────────────────────────────────────────────────────────
    private String universityName;

    @NotBlank(message = "Warden name is required")
    private String wardenName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    // ── MULTI mode hostel list ─────────────────────────────────────────────────
    private List<RequestedHostelDto> requestedHostels;

    @Data
    public static class RequestedHostelDto {
        @NotBlank(message = "Hostel name is required")
        private String hostelName;
        private String hostelType; // BOYS | GIRLS | MIXED
        private Integer totalRooms;
    }
}
