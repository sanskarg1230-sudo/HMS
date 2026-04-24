package com.hms.dto;

import lombok.Data;

@Data
public class RoomDto {
    private String roomNumber;
    private String type; // SINGLE | DOUBLE | TRIPLE
    private Integer capacity;
    private Boolean isAC = false; // AC | Non-AC
}
