package com.hms;

import com.hms.model.Hostel;
import com.hms.model.User;
import com.hms.repository.HostelRepository;
import com.hms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DbInspector implements CommandLineRunner {
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;

    public DbInspector(HostelRepository hostelRepository, UserRepository userRepository) {
        this.hostelRepository = hostelRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("=== DB INSPECTION ===");
        userRepository.findByEmail("admin@hms.edu").ifPresent(admin -> {
            System.out.println("Admin ID: " + admin.getId());
            List<Hostel> hostels = hostelRepository.findAll();
            for (Hostel h : hostels) {
                System.out.println("Hostel: " + h.getHostelName() + " | WardenID: " + h.getWardenId() + " | Deleted: " + h.getIsDeleted());
            }
        });
        System.out.println("=====================");
    }
}
