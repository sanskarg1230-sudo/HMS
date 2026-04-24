package com.hms.service;

import com.hms.dto.AdminRequestDto;
import com.hms.model.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRequestService {

    private final AdminRequestRepository adminRequestRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${hms.frontend.url}")
    private String hmsFrontendUrl;

    public AdminRequest submitRequest(AdminRequestDto dto) {
        if (adminRequestRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("A request with this email already exists.");
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email already exists.");
        }

        // Validate based on management type
        String mgType = dto.getManagementType() != null ? dto.getManagementType().toUpperCase() : "SINGLE";

        if ("SINGLE".equals(mgType)) {
            if (dto.getHostelName() == null || dto.getHostelName().isBlank()) {
                throw new RuntimeException("Hostel name is required for Single Hostel mode.");
            }
            if (dto.getUniversityName() == null || dto.getUniversityName().isBlank()) {
                throw new RuntimeException("University name is required.");
            }
        } else if ("MULTI".equals(mgType)) {
            if (dto.getRequestedHostels() == null || dto.getRequestedHostels().isEmpty()) {
                throw new RuntimeException("At least one hostel is required for Multi Hostel mode.");
            }
            for (AdminRequestDto.RequestedHostelDto rh : dto.getRequestedHostels()) {
                if (rh.getHostelName() == null || rh.getHostelName().isBlank()) {
                    throw new RuntimeException("Each hostel must have a name.");
                }
            }
        }

        AdminRequest request = new AdminRequest();
        request.setManagementType(mgType);
        request.setUniversityName(dto.getUniversityName());
        request.setWardenName(dto.getWardenName());
        request.setEmail(dto.getEmail());
        request.setPhone(dto.getPhone());
        request.setAddress(dto.getAddress());
        request.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        request.setStatus("PENDING");

        if ("SINGLE".equals(mgType)) {
            // Store SINGLE hostel details directly on the request
            request.setHostelName(dto.getHostelName());
            request.setHostelType(dto.getHostelType() != null ? dto.getHostelType().toUpperCase() : "MIXED");
            request.setTotalRooms(dto.getTotalRooms() != null ? dto.getTotalRooms() : 5);
        } else {
            // MULTI — store each hostel in child table
            for (AdminRequestDto.RequestedHostelDto hDto : dto.getRequestedHostels()) {
                RequestedHostel rh = new RequestedHostel();
                rh.setAdminRequest(request);
                rh.setHostelName(hDto.getHostelName());
                rh.setHostelType(hDto.getHostelType() != null ? hDto.getHostelType().toUpperCase() : "MIXED");
                rh.setTotalRooms(hDto.getTotalRooms() != null ? hDto.getTotalRooms() : 5);
                request.getRequestedHostels().add(rh);
            }
        }

        return adminRequestRepository.save(request);
    }

    public List<AdminRequest> getAllRequests() {
        return adminRequestRepository.findAll();
    }

    public AdminRequest approveRequest(Long id) {
        AdminRequest req = adminRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"PENDING".equals(req.getStatus())) {
            throw new RuntimeException("Request is already " + req.getStatus());
        }

        // 1. Create Admin User
        User admin = new User();
        admin.setName(req.getWardenName());
        admin.setEmail(req.getEmail());
        admin.setPassword(req.getPasswordHash());
        admin.setRole("admin");
        admin.setManagementType(req.getManagementType());
        User savedAdmin = userRepository.save(admin);

        // 2. Create Hostels based on management type
        if ("SINGLE".equals(req.getManagementType())) {
            // Use the stored SINGLE mode hostel details
            String hostelType = req.getHostelType() != null ? req.getHostelType() : "MIXED";
            int totalRooms = req.getTotalRooms() != null ? req.getTotalRooms() : 5;
            createHostel(req.getHostelName(), hostelType, req.getUniversityName(), req.getAddress(), totalRooms, savedAdmin.getId());
        } else {
            // MULTI — create each requested hostel
            for (RequestedHostel rh : req.getRequestedHostels()) {
                String hostelType = rh.getHostelType() != null ? rh.getHostelType() : "MIXED";
                int totalRooms = rh.getTotalRooms() != null ? rh.getTotalRooms() : 5;
                createHostel(rh.getHostelName(), hostelType, req.getUniversityName(), req.getAddress(), totalRooms, savedAdmin.getId());
            }
        }

        req.setStatus("APPROVED");
        adminRequestRepository.save(req);

        // Send approval email
        String loginLink = hmsFrontendUrl + "/login";
        String hostelNameForEmail = "SINGLE".equals(req.getManagementType())
                ? req.getHostelName()
                : req.getRequestedHostels().size() + " hostels";
        emailService.sendAdminApprovalEmail(req.getEmail(), req.getWardenName(), hostelNameForEmail, loginLink);

        return req;
    }

    private void createHostel(String name, String type, String uni, String addr, int rooms, Long wardenId) {
        Hostel hostel = new Hostel();
        hostel.setHostelName(name);
        hostel.setHostelType(type);
        hostel.setUniversityName(uni);
        hostel.setAddress(addr);
        hostel.setRoomCount(rooms);
        hostel.setCapacity(rooms);
        hostel.setWardenId(wardenId);
        Hostel savedHostel = hostelRepository.save(hostel);

        // Seed starter rooms (up to 10, or totalRooms if <= 10)
        int seedCount = Math.min(rooms, 10);
        for (int i = 1; i <= seedCount; i++) {
            Room room = new Room();
            room.setHostelId(savedHostel.getId());
            room.setRoomNumber(String.valueOf(100 + i));
            room.setType("SINGLE");
            room.setCapacity(1);
            room.setOccupied(false);
            room.setOccupantCount(0);
            room.setIsAC(false);
            roomRepository.save(room);
        }
    }

    public AdminRequest rejectRequest(Long id) {
        AdminRequest req = adminRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus("REJECTED");
        return adminRequestRepository.save(req);
    }
}
