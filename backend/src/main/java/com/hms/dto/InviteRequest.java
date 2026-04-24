package com.hms.dto;

import lombok.Data;

@Data
public class InviteRequest {
    private String name;
    private String email;
    private Long roomId;
    /**
     * Optional — when a MULTI-hostel admin invites a student, they select which hostel
     * the student belongs to. If null, falls back to the X-Hostel-Id header value.
     */
    private Long hostelId;
}
