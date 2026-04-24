package com.hms.repository;

import com.hms.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostelId(Long hostelId);
    List<Room> findByHostelIdAndOccupied(Long hostelId, Boolean occupied);
}
