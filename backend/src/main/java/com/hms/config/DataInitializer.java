package com.hms.config;

import com.hms.model.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.hms.repository.StudentInviteRepository;

/**
 * Seeds essential data on every startup if not already present.
 * - SuperAdmin user
 * - Demo Hostel (Green Campus Hostel)
 * - 5 demo rooms
 * - Admin linked to demo hostel
 * - Student linked to demo hostel + room 101
 * - 2 unpaid fee records for the student
 * - 2 demo notices
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final NoticeRepository noticeRepository;
    private final StudentInviteRepository studentInviteRepository; // Added for cleanup
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("[HMS] Starting database cleanup...");

        // 0. Cleanup - Keep only official Demo/Seed accounts
        java.util.Set<String> safeEmails = java.util.Set.of(
            "superadmin@hms.edu", "super@hms.com", 
            "admin@hms.edu", "admin@hms.com", 
            "student@hms.edu", "jane@hms.edu"
        );

        // Delete unknown users
        userRepository.findAll().stream()
            .filter(u -> !safeEmails.contains(u.getEmail()))
            .forEach(u -> {
                System.out.println("[HMS] Cleaning up test user: " + u.getEmail());
                userRepository.delete(u);
            });

        // 1. Super Admin
        User superAdmin = seedUser("Super Admin", "superadmin@hms.edu", "superadmin123", "super_admin", null, null);

        // 2. Demo Hostel
        Hostel demoHostel = seedHostel();

        // 3. Admin linked to demo hostel
        User admin = seedUser("Admin User", "admin@hms.edu", "admin123", "admin", demoHostel.getId(), null);

        // Update hostels with wardenId
        demoHostel.setWardenId(admin.getId());
        hostelRepository.save(demoHostel);

        // 4. Demo Rooms (Green Campus)
        Room room101 = seedRoom(demoHostel.getId(), "101", "SINGLE", 1);
        seedRoom(demoHostel.getId(), "102", "SINGLE", 1);
        seedRoom(demoHostel.getId(), "103", "DOUBLE", 2);
        seedRoom(demoHostel.getId(), "104", "DOUBLE", 2);
        seedRoom(demoHostel.getId(), "105", "TRIPLE", 3);

        // EXTRA: Second Demo Hostel for Multi-Hostel Testing
        Hostel secondHostel = seedSecondHostel();
        secondHostel.setWardenId(admin.getId());
        hostelRepository.save(secondHostel);
        
        // Link same admin to second hostel too
        admin.setHostelId(demoHostel.getId()); // Default to first
        userRepository.save(admin);
        
        // Seed rooms for second hostel
        seedRoom(secondHostel.getId(), "B101", "SINGLE", 1);
        seedRoom(secondHostel.getId(), "B102", "DOUBLE", 2);

        // 5. Student linked to demo hostel + room 101
        User student = seedUser("John Doe", "student@hms.edu", "student123", "student", demoHostel.getId(), room101.getId());
        
        // 5b. Second Student linked to room 103 (DOUBLE)
        Room room103 = roomRepository.findByHostelId(demoHostel.getId()).stream().filter(r -> r.getRoomNumber().equals("103")).findFirst().orElse(null);
        User jane = seedUser("Jane Smith", "jane@hms.edu", "jane123", "student", demoHostel.getId(), room103 != null ? room103.getId() : null);

        // Mark rooms as occupied and update counts
        if (room101 != null && (room101.getOccupantCount() == null || room101.getOccupantCount() == 0)) {
            room101.setOccupied(true);
            room101.setOccupantCount(1);
            room101.setAssignedStudentId(student.getId());
            roomRepository.save(room101);
        }
        
        if (room103 != null && (room103.getOccupantCount() == null || room103.getOccupantCount() == 0)) {
            room103.setOccupied(false); // Double room, 1 occupant = not full
            room103.setOccupantCount(1);
            room103.setAssignedStudentId(jane.getId());
            roomRepository.save(room103);
        }

        // 6. Demo Fee Records
        seedFeeRecord(student.getId(), "John Doe", demoHostel.getId(), 2000.0, "March", 2025);
        seedFeeRecord(student.getId(), "John Doe", demoHostel.getId(), 2000.0, "April", 2025);

        // 7. Demo Notices
        seedNotice(demoHostel.getId(), admin.getId(), "Admin User", "Welcome to Green Campus Hostel! 🎉",
                "We're happy to have you here. Please read all the hostel rules in the notice board.", true);
        seedNotice(demoHostel.getId(), admin.getId(), "Admin User", "Fee Due Date Reminder",
                "Monthly fees for April 2025 are due by April 15th. Please pay via the fees section.", false);
        seedNotice(demoHostel.getId(), admin.getId(), "Admin User", "Hostel Night Event 🎵",
                "Join us for a cultural night this Friday at 7 PM in the main courtyard. Snacks provided!", false);

        System.out.println("[HMS] DataInitializer complete.");
    }

    private User seedUser(String name, String email, String rawPassword, String role, Long hostelId, Long roomId) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setHostelId(hostelId);
            user.setRoomId(roomId);
            User saved = userRepository.save(user);
            System.out.println("[HMS] Created user: " + email + " (" + role + ")");
            return saved;
        } else {
            // Update existing user if needed (for iterative development seeding)
            boolean updated = false;
            if (hostelId != null && !hostelId.equals(user.getHostelId())) {
                user.setHostelId(hostelId);
                updated = true;
            }
            if (roomId != null && !roomId.equals(user.getRoomId())) {
                user.setRoomId(roomId);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
                System.out.println("[HMS] Updated demo user linkage: " + email);
            }
            return user;
        }
    }

    private Hostel seedHostel() {
        Hostel h = hostelRepository.findAll().stream()
                .filter(h1 -> "Green Campus Hostel".equals(h1.getHostelName()))
                .findFirst()
                .orElse(new Hostel());
                
        h.setHostelName("Green Campus Hostel");
        h.setUniversityName("Delhi University");
        h.setAddress("123 Campus Road, North Delhi, DL 110007");
        h.setRoomCount(5);
        h.setWardenPhone("+91 9876543210");
        h.setWardenEmail("admin@hms.edu");
        h.setIsDeleted(false);
        return hostelRepository.save(h);
    }

    private Hostel seedSecondHostel() {
        Hostel h = hostelRepository.findAll().stream()
                .filter(h1 -> "Blue Sky Hostel".equals(h1.getHostelName()))
                .findFirst()
                .orElse(new Hostel());
                
        h.setHostelName("Blue Sky Hostel");
        h.setUniversityName("IIT Delhi");
        h.setAddress("Technology Lane, Hauz Khas, New Delhi, DL 110016");
        h.setRoomCount(2);
        h.setWardenPhone("+91 9999988888");
        h.setWardenEmail("admin@hms.edu");
        h.setIsDeleted(false);
        return hostelRepository.save(h);
    }

    private Room seedRoom(Long hostelId, String roomNumber, String type, Integer capacity) {
        return roomRepository.findByHostelId(hostelId).stream()
                .filter(r -> r.getRoomNumber().equals(roomNumber))
                .findFirst()
                .orElseGet(() -> {
                    Room r = new Room();
                    r.setHostelId(hostelId);
                    r.setRoomNumber(roomNumber);
                    r.setType(type);
                    r.setCapacity(capacity);
                    r.setOccupied(false);
                    return roomRepository.save(r);
                });
    }

    private void seedFeeRecord(Long studentId, String studentName, Long hostelId, Double amount, String month, Integer year) {
        boolean exists = feeRecordRepository.findByStudentIdOrderByYearDescCreatedAtDesc(studentId)
                .stream().anyMatch(f -> f.getMonth().equals(month) && f.getYear().equals(year));
        if (!exists) {
            FeeRecord f = new FeeRecord();
            f.setStudentId(studentId);
            f.setStudentName(studentName);
            f.setHostelId(hostelId);
            f.setAmount(amount);
            f.setMonth(month);
            f.setYear(year);
            f.setStatus("UNPAID");
            f.setCurrency("INR");
            feeRecordRepository.save(f);
        }
    }

    private void seedNotice(Long hostelId, Long adminId, String adminName, String title, String message, boolean pinned) {
        boolean exists = noticeRepository.findByHostelIdOrderByIsPinnedDescCreatedAtDesc(hostelId)
                .stream().anyMatch(n -> n.getTitle().equals(title));
        if (!exists) {
            Notice n = new Notice();
            n.setHostelId(hostelId);
            n.setAdminId(adminId);
            n.setAdminName(adminName);
            n.setTitle(title);
            n.setMessage(message);
            n.setIsPinned(pinned);
            noticeRepository.save(n);
        }
    }
}
