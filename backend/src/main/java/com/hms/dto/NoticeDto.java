package com.hms.dto;

import lombok.Data;

@Data
public class NoticeDto {
    private String title;
    private String message;
    private Boolean isPinned = false;
    private String expiresAt; // ISO date string, optional
}
