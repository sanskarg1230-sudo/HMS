package com.hms.service;

import com.hms.dto.*;
import com.hms.model.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final HostelRepository hostelRepository;
    private final StudentProfileRepository profileRepo;
    private final StudentParentsRepository parentsRepo;
    private final StudentAddressRepository addressRepo;
    private final StudentMedicalRepository medicalRepo;
    private final StudentLeaveRepository leaveRepo;
    private final StudentDocumentRepository documentRepo;

    @Value("${hms.uploads.dir:./uploads/student-docs}")
    private String uploadsDir;

    // ── Full Profile Assembly ─────────────────────────────────────────────────

    public StudentProfileDto getFullProfile(Long studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        StudentProfile profile = profileRepo.findByStudentId(studentId).orElse(null);
        StudentParents parents = parentsRepo.findByStudentId(studentId).orElse(null);
        StudentAddress address = addressRepo.findByStudentId(studentId).orElse(null);
        StudentMedical medical = medicalRepo.findByStudentId(studentId).orElse(null);

        String roomNumber = null;
        String hostelName = null;
        if (user.getRoomId() != null) {
            roomRepository.findById(user.getRoomId())
                    .ifPresent(r -> {});  // resolved below
            var roomOpt = roomRepository.findById(user.getRoomId());
            if (roomOpt.isPresent()) roomNumber = roomOpt.get().getRoomNumber();
        }
        if (user.getHostelId() != null) {
            var hostelOpt = hostelRepository.findById(user.getHostelId());
            if (hostelOpt.isPresent()) hostelName = hostelOpt.get().getHostelName();
        }

        return StudentProfileDto.from(user, profile, parents, address, medical, roomNumber, hostelName);
    }

    // ── Upsert helpers ────────────────────────────────────────────────────────

    @Transactional
    public StudentProfile updatePersonal(Long studentId, StudentProfileUpdateDto dto) {
        StudentProfile p = profileRepo.findByStudentId(studentId)
                .orElseGet(() -> { StudentProfile n = new StudentProfile(); n.setStudentId(studentId); return n; });
        if (dto.getPhone() != null)      p.setPhone(dto.getPhone());
        if (dto.getUniversity() != null) p.setUniversity(dto.getUniversity());
        if (dto.getCourse() != null)     p.setCourse(dto.getCourse());
        if (dto.getYear() != null)       p.setYear(dto.getYear());
        if (dto.getJoinDate() != null)   p.setJoinDate(dto.getJoinDate());
        return profileRepo.save(p);
    }

    @Transactional
    public StudentParents updateParents(Long studentId, StudentParentsUpdateDto dto) {
        StudentParents p = parentsRepo.findByStudentId(studentId)
                .orElseGet(() -> { StudentParents n = new StudentParents(); n.setStudentId(studentId); return n; });
        if (dto.getFatherName() != null)      p.setFatherName(dto.getFatherName());
        if (dto.getMotherName() != null)      p.setMotherName(dto.getMotherName());
        if (dto.getGuardianName() != null)    p.setGuardianName(dto.getGuardianName());
        if (dto.getParentPhone() != null)     p.setParentPhone(dto.getParentPhone());
        if (dto.getParentEmail() != null)     p.setParentEmail(dto.getParentEmail());
        if (dto.getEmergencyContact() != null) p.setEmergencyContact(dto.getEmergencyContact());
        return parentsRepo.save(p);
    }

    @Transactional
    public StudentAddress updateAddress(Long studentId, StudentAddressUpdateDto dto) {
        StudentAddress a = addressRepo.findByStudentId(studentId)
                .orElseGet(() -> { StudentAddress n = new StudentAddress(); n.setStudentId(studentId); return n; });
        if (dto.getAddressLine() != null) a.setAddressLine(dto.getAddressLine());
        if (dto.getCity() != null)        a.setCity(dto.getCity());
        if (dto.getState() != null)       a.setState(dto.getState());
        if (dto.getCountry() != null)     a.setCountry(dto.getCountry());
        if (dto.getPincode() != null)     a.setPincode(dto.getPincode());
        return addressRepo.save(a);
    }

    @Transactional
    public StudentMedical updateMedical(Long studentId, StudentMedicalUpdateDto dto) {
        StudentMedical m = medicalRepo.findByStudentId(studentId)
                .orElseGet(() -> { StudentMedical n = new StudentMedical(); n.setStudentId(studentId); return n; });
        if (dto.getBloodGroup() != null)        m.setBloodGroup(dto.getBloodGroup());
        if (dto.getAllergies() != null)          m.setAllergies(dto.getAllergies());
        if (dto.getMedicalConditions() != null) m.setMedicalConditions(dto.getMedicalConditions());
        if (dto.getMedications() != null)       m.setMedications(dto.getMedications());
        if (dto.getDoctorContact() != null)     m.setDoctorContact(dto.getDoctorContact());
        if (dto.getNotes() != null)             m.setNotes(dto.getNotes());
        return medicalRepo.save(m);
    }

    // ── Leave ─────────────────────────────────────────────────────────────────

    public List<StudentLeave> getLeaveHistory(Long studentId) {
        return leaveRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public StudentLeave requestLeave(Long studentId, StudentLeaveRequestDto dto) {
        StudentLeave leave = new StudentLeave();
        leave.setStudentId(studentId);
        leave.setFromDate(dto.getFromDate());
        leave.setToDate(dto.getToDate());
        leave.setReason(dto.getReason());
        leave.setStatus("PENDING");
        return leaveRepo.save(leave);
    }

    @Transactional
    public StudentLeave actionLeave(Long leaveId, String status, String adminNote, String adminName) {
        StudentLeave leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave record not found: " + leaveId));
        if (!List.of("APPROVED", "REJECTED").contains(status)) {
            throw new RuntimeException("Invalid status. Must be APPROVED or REJECTED");
        }
        leave.setStatus(status);
        leave.setAdminNote(adminNote);
        leave.setActionedBy(adminName);
        return leaveRepo.save(leave);
    }

    // Admins can also manually add a leave record directly
    @Transactional
    public StudentLeave addLeaveRecord(Long studentId, StudentLeaveRequestDto dto, String adminName) {
        StudentLeave leave = new StudentLeave();
        leave.setStudentId(studentId);
        leave.setFromDate(dto.getFromDate());
        leave.setToDate(dto.getToDate());
        leave.setReason(dto.getReason());
        leave.setStatus("APPROVED");
        leave.setActionedBy(adminName);
        leave.setAdminNote("Logged by admin");
        return leaveRepo.save(leave);
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    public List<StudentDocument> getDocuments(Long studentId) {
        return documentRepo.findByStudentIdOrderByUploadedAtDesc(studentId);
    }

    @Transactional
    public StudentDocument uploadDocument(Long studentId, String documentType, MultipartFile file) throws IOException {
        // Ensure upload dir exists
        Path uploadPath = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Store with UUID to avoid collisions
        String ext = "";
        String origName = file.getOriginalFilename();
        if (origName != null && origName.contains(".")) {
            ext = origName.substring(origName.lastIndexOf('.'));
        }
        String storedName = UUID.randomUUID() + ext;
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Remove any old document of same type for this student (replace)
        documentRepo.findByStudentIdOrderByUploadedAtDesc(studentId).stream()
                .filter(d -> d.getDocumentType().equals(documentType))
                .findFirst()
                .ifPresent(old -> {
                    // try to delete old file
                    try { Files.deleteIfExists(uploadPath.resolve(old.getStoredFilename())); } catch (Exception ignored) {}
                    documentRepo.delete(old);
                });

        StudentDocument doc = new StudentDocument();
        doc.setStudentId(studentId);
        doc.setDocumentType(documentType);
        doc.setOriginalFilename(origName);
        doc.setStoredFilename(storedName);
        doc.setFilePath(filePath.toString());
        doc.setMimeType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setStatus("PENDING");
        return documentRepo.save(doc);
    }

    @Transactional
    public StudentDocument verifyDocument(Long docId, String adminName) {
        StudentDocument doc = documentRepo.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + docId));
        doc.setStatus("VERIFIED");
        doc.setVerifiedBy(adminName);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setAdminNote(null);
        return documentRepo.save(doc);
    }

    @Transactional
    public StudentDocument rejectDocument(Long docId, String adminName, String note) {
        StudentDocument doc = documentRepo.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + docId));
        doc.setStatus("REJECTED");
        doc.setVerifiedBy(adminName);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setAdminNote(note);
        return documentRepo.save(doc);
    }

    public Resource loadDocumentAsResource(Long docId) {
        StudentDocument doc = documentRepo.findById(docId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Document not found: " + docId));
        try {
            Path filePath = Paths.get(doc.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) return resource;
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "File missing from cloud storage: " + doc.getStoredFilename());
        } catch (MalformedURLException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Invalid file path", e);
        }
    }

    public StudentDocument getDocument(Long docId) {
        return documentRepo.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + docId));
    }
}
