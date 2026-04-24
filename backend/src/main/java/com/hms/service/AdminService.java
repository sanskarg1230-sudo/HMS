package com.hms.service;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final ComplaintRepository complaintRepository;
    private final NoticeRepository noticeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public void logAction(Long hostelId, String source, String actionType, String details) {
        auditLogRepository.save(new AuditLog(hostelId, source, actionType, details));
    }

    // ── Helper: Get admin's hostel ─────────────────────────────────────────────
    private User getAdmin(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    private Long resolveHostelId(User admin, Long providedId) {
        if (providedId != null) return providedId;
        if (admin.getHostelId() != null) return admin.getHostelId();
        throw new RuntimeException("Hostel context required but not found for this admin.");
    }

    public List<Hostel> getHostels(String email) {
        User admin = getAdmin(email);
        return hostelRepository.findByWardenIdAndIsDeletedFalse(admin.getId());
    }

    // ── Room Management ────────────────────────────────────────────────────────
    public List<Room> getRooms(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        List<Room> rooms = roomRepository.findByHostelId(finalHostelId);
        
        // Populate occupant names for all rooms (not just first assigned)
        for (Room room : rooms) {
            List<User> occupants = userRepository.findByRoomId(room.getId());
            room.setOccupantNames(occupants.stream().map(User::getName).toList());
            
            // Sync count and occupied status based on actual mapping
            room.setOccupantCount(occupants.size());
            room.setOccupied(occupants.size() >= room.getCapacity());
            
            // Keep assignedStudentId as the primer (first one in the list if any)
            if (!occupants.isEmpty()) {
                room.setAssignedStudentId(occupants.get(0).getId());
            } else {
                room.setAssignedStudentId(null);
            }
        }
        return rooms;
    }

    public Room addRoom(String email, Long hostelId, RoomDto dto) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Room room = new Room();
        room.setHostelId(finalHostelId);
        room.setRoomNumber(dto.getRoomNumber());
        room.setType(dto.getType());
        room.setCapacity(dto.getCapacity());
        room.setIsAC(dto.getIsAC() != null ? dto.getIsAC() : false);
        room.setOccupied(false);
        room.setOccupantCount(0);
        Room savedRoom = roomRepository.save(room);
        logAction(finalHostelId, "ADMIN", "ROOM_ADDED", "Added Room " + dto.getRoomNumber() + " (" + dto.getType() + ")");
        return savedRoom;
    }

    public void deleteRoom(String email, Long hostelId, Long roomId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        if (!Objects.equals(room.getHostelId(), finalHostelId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (room.getOccupied()) {
            throw new RuntimeException("Cannot delete an occupied room");
        }
        String roomName = room.getRoomNumber();
        roomRepository.delete(room);
        logAction(finalHostelId, "ADMIN", "ROOM_DELETED", "Deleted Room " + roomName);
    }

    public void assignRoom(String email, Long hostelId, Long studentId, Long roomId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!Objects.equals(room.getHostelId(), finalHostelId)) throw new RuntimeException("Unauthorized");
        
        // Strictly check capacity based on LIVE database mappings, not the entity property
        long actualCount = userRepository.countByRoomId(roomId);
        if (actualCount >= room.getCapacity()) {
            throw new RuntimeException("Room is already at full capacity");
        }

        // Keep entity metrics loosely in sync for backward compatibility
        if (student.getRoomId() != null) {
            roomRepository.findById(student.getRoomId()).ifPresent(prev -> {
                long prevActualCount = userRepository.countByRoomId(prev.getId());
                prev.setOccupantCount(Math.max(0, (int) prevActualCount - 1));
                if (prev.getOccupantCount() == 0) {
                    prev.setOccupied(false);
                    prev.setAssignedStudentId(null);
                }
                roomRepository.save(prev);
            });
        }

        int newCount = (int) actualCount + 1;
        room.setOccupantCount(newCount);
        room.setOccupied(newCount >= room.getCapacity());
        if (room.getAssignedStudentId() == null) {
            room.setAssignedStudentId(studentId);
        }
        roomRepository.save(room);

        student.setRoomId(roomId);
        userRepository.save(student);
        logAction(finalHostelId, "ADMIN", "ROOM_ASSIGNED", "Assigned " + student.getName() + " to Room " + room.getRoomNumber());
    }

    // ── Student Management ─────────────────────────────────────────────────────
    public List<User> getStudents(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return userRepository.findAll().stream()
                .filter(u -> "student".equals(u.getRole()) && Objects.equals(finalHostelId, u.getHostelId()))
                .toList();
    }

    // ── Fee Management ─────────────────────────────────────────────────────────
    public List<FeeRecord> getFees(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return feeRecordRepository.findByHostelIdOrderByYearDescCreatedAtDesc(finalHostelId);
    }

    public FeeRecord addFeeRecord(String email, Long hostelId, FeeDto dto) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        FeeRecord fee = new FeeRecord();
        fee.setStudentId(dto.getStudentId());
        fee.setStudentName(dto.getStudentName());
        fee.setHostelId(finalHostelId);
        fee.setAmount(dto.getAmount());
        fee.setMonth(dto.getMonth());
        fee.setYear(dto.getYear());
        fee.setStatus("UNPAID");
        if (dto.getCurrency() != null && !dto.getCurrency().isEmpty()) {
            fee.setCurrency(dto.getCurrency());
        }
        FeeRecord saved = feeRecordRepository.save(fee);
        
        String currencySymbol = fee.getCurrency().equals("INR") ? "₹" : (fee.getCurrency().equals("USD") ? "$" : (fee.getCurrency().equals("EUR") ? "€" : fee.getCurrency() + " "));
        logAction(finalHostelId, "ADMIN", "FEE_GENERATED", "Generated fee of " + currencySymbol + dto.getAmount() + " for " + dto.getStudentName() + " (" + dto.getMonth() + " " + dto.getYear() + ")");
        return saved;
    }

    public FeeRecord markFeePaid(String email, Long hostelId, Long feeId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        FeeRecord fee = feeRecordRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
        if (!Objects.equals(fee.getHostelId(), finalHostelId)) throw new RuntimeException("Unauthorized");
        fee.setStatus("PAID");
        FeeRecord saved = feeRecordRepository.save(fee);
        logAction(finalHostelId, "ADMIN", "FEE_PAID", "Marked fee as PAID for " + fee.getStudentName() + " (" + fee.getMonth() + " " + fee.getYear() + ")");
        return saved;
    }

    // ── Complaint Management ───────────────────────────────────────────────────
    public List<Complaint> getComplaints(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return complaintRepository.findByHostelIdOrderByCreatedAtDesc(finalHostelId);
    }

    public Complaint resolveComplaint(String email, Long hostelId, Long complaintId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Complaint c = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        if (!Objects.equals(c.getHostelId(), finalHostelId)) throw new RuntimeException("Unauthorized");
        c.setStatus("RESOLVED");
        return complaintRepository.save(c);
    }

    // ── Notices ────────────────────────────────────────────────────────────────
    public List<Notice> getNotices(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return noticeRepository.findByHostelIdOrderByIsPinnedDescCreatedAtDesc(finalHostelId);
    }

    public Notice createNotice(String email, Long hostelId, NoticeDto dto) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Notice n = new Notice();
        n.setHostelId(finalHostelId);
        n.setAdminId(admin.getId());
        n.setAdminName(admin.getName());
        n.setTitle(dto.getTitle());
        n.setMessage(dto.getMessage());
        n.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        if (dto.getExpiresAt() != null && !dto.getExpiresAt().isBlank()) {
            n.setExpiresAt(LocalDate.parse(dto.getExpiresAt()));
        }
        Notice saved = noticeRepository.save(n);
        logAction(finalHostelId, "ADMIN", "NOTICE_CREATED", "Published notice: " + dto.getTitle());
        return saved;
    }

    public Notice updateNotice(String email, Long hostelId, Long noticeId, NoticeDto dto) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Notice n = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        if (!Objects.equals(n.getHostelId(), finalHostelId)) throw new RuntimeException("Unauthorized");
        n.setTitle(dto.getTitle());
        n.setMessage(dto.getMessage());
        n.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        return noticeRepository.save(n);
    }

    public void deleteNotice(String email, Long hostelId, Long noticeId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        // Ensure notice belongs to this hostel (if hostelId provided)
        if (finalHostelId != null && !Objects.equals(notice.getHostelId(), finalHostelId)) {
            throw new RuntimeException("Notice not found in this hostel");
        }
        noticeRepository.delete(notice);
    }

    // ── Hostel Info ────────────────────────────────────────────────────────────
    public Hostel getHostelInfo(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return hostelRepository.findById(finalHostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
    }

    public Hostel updateHostelInfo(String email, Long hostelId, UpdateHostelDto dto) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        Hostel hostel = hostelRepository.findById(finalHostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        // IDOR check: only the warden who owns this hostel may update it
        if (!hostel.getWardenId().equals(admin.getId())) {
            throw new RuntimeException("Unauthorized: you do not own this hostel");
        }
        if (dto.getHostelName() != null) hostel.setHostelName(dto.getHostelName());
        if (dto.getUniversityName() != null) hostel.setUniversityName(dto.getUniversityName());
        if (dto.getAddress() != null) hostel.setAddress(dto.getAddress());
        if (dto.getWardenPhone() != null) hostel.setWardenPhone(dto.getWardenPhone());
        if (dto.getWardenEmail() != null) hostel.setWardenEmail(dto.getWardenEmail());
        return hostelRepository.save(hostel);
    }

    public void deleteStudent(String adminEmail, Long hostelId, Long studentId) {
        User admin = getAdmin(adminEmail);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"student".equals(student.getRole()) || !Objects.equals(finalHostelId, student.getHostelId())) {
            throw new RuntimeException("Unauthorized to delete this student record.");
        }

        // Unassign room if necessary
        if (student.getRoomId() != null) {
            roomRepository.findById(student.getRoomId()).ifPresent(room -> {
                // Fetch actual occupants excluding the one being deleted
                List<User> remainingOccupants = userRepository.findByRoomId(room.getId()).stream()
                        .filter(u -> !u.getId().equals(student.getId()))
                        .toList();
                
                int newCount = remainingOccupants.size();
                room.setOccupantCount(newCount);
                room.setOccupied(newCount >= room.getCapacity());
                
                if (newCount > 0) {
                    room.setAssignedStudentId(remainingOccupants.get(0).getId());
                } else {
                    room.setAssignedStudentId(null);
                }
                roomRepository.save(room);
            });
        }

        userRepository.delete(student);
        logAction(hostelId, "ADMIN", "STUDENT_DELETED", "Deleted student account: " + student.getName());
    }

    public List<AuditLog> getLogs(String email, Long hostelId) {
        User admin = getAdmin(email);
        Long finalHostelId = resolveHostelId(admin, hostelId);
        return auditLogRepository.findByHostelIdOrderByTimestampDesc(finalHostelId);
    }

    public void softDeleteHostel(String email, Long hostelId) {
        User admin = getAdmin(email);
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        if (!hostel.getWardenId().equals(admin.getId())) throw new RuntimeException("Unauthorized");
        
        hostel.setIsDeleted(true);
        hostelRepository.save(hostel);
        logAction(hostelId, "ADMIN", "HOSTEL_DELETED", "Soft-deleted hostel: " + hostel.getHostelName());
    }
}
