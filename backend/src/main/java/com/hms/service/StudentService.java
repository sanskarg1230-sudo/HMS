package com.hms.service;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final ComplaintRepository complaintRepository;
    private final NoticeRepository noticeRepository;
    private final HostelRepository hostelRepository;
    private final PasswordEncoder passwordEncoder;

    private User getStudent(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // ── Room Info
    public Map<String, Object> getMyRoom(String email) {
        User student = getStudent(email);
        Map<String, Object> result = new HashMap<>();
        result.put("student", student);

        if (student.getRoomId() != null) {
            roomRepository.findById(student.getRoomId()).ifPresent(r -> result.put("room", r));
        }
        if (student.getHostelId() != null) {
            hostelRepository.findById(student.getHostelId()).ifPresent(h -> result.put("hostel", h));
        }
        return result;
    }

    // ── Fee Records
    public List<FeeRecord> getMyFees(String email) {
        User student = getStudent(email);
        return feeRecordRepository.findByStudentIdOrderByYearDescCreatedAtDesc(student.getId());
    }

    // ── Complaints
    public Complaint submitComplaint(String email, ComplaintDto dto) {
        User student = getStudent(email);

        String roomNumber = "N/A";
        if (student.getRoomId() != null) {
            roomNumber = roomRepository.findById(student.getRoomId())
                    .map(Room::getRoomNumber).orElse("N/A");
        }

        Complaint c = new Complaint();
        c.setStudentId(student.getId());
        c.setHostelId(student.getHostelId());
        c.setStudentName(student.getName());
        c.setRoomNumber(roomNumber);
        c.setTitle(dto.getTitle());
        c.setDescription(dto.getDescription());
        c.setStatus("OPEN");
        return complaintRepository.save(c);
    }

    public List<Complaint> getMyComplaints(String email) {
        User student = getStudent(email);
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    // ── Notices
    public List<Notice> getNotices(String email) {
        User student = getStudent(email);
        return noticeRepository.findByHostelIdOrderByIsPinnedDescCreatedAtDesc(student.getHostelId());
    }

    // ── Profile
    public User getProfile(String email) {
        return getStudent(email);
    }

    public User updateProfile(String email, UpdateProfileDto dto) {
        User student = getStudent(email);
        if (dto.getName() != null && !dto.getName().isBlank()) {
            student.setName(dto.getName());
        }
        return userRepository.save(student);
    }

    public void changePassword(String email, ChangePasswordDto dto) {
        User student = getStudent(email);
        if (!passwordEncoder.matches(dto.getOldPassword(), student.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        student.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(student);
    }
}
