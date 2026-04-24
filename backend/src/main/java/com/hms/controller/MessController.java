package com.hms.controller;

import com.hms.model.MessMenu;
import com.hms.model.User;
import com.hms.repository.UserRepository;
import com.hms.service.MessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/mess/menu")
@RequiredArgsConstructor
public class MessController {

    private final MessService messService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Optional<MessMenu>> getMenu(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(messService.getLatestMenu(user.getHostelId()));
    }

    @PostMapping
    public ResponseEntity<MessMenu> createMenu(Authentication auth, @RequestBody MessMenu menu) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(messService.saveOrUpdateMenu(user.getHostelId(), menu));
    }

    @PostMapping("/import")
    public ResponseEntity<MessMenu> importMenu(Authentication auth, @RequestParam("file") MultipartFile file) throws IOException {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(messService.importExcel(file.getInputStream(), user.getHostelId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessMenu> updateMenu(Authentication auth, @PathVariable Long id, @RequestBody MessMenu menu) {
        User user = getAuthenticatedUser(auth);
        menu.setId(id);
        return ResponseEntity.ok(messService.saveOrUpdateMenu(user.getHostelId(), menu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(Authentication auth, @PathVariable Long id) {
        User user = getAuthenticatedUser(auth);
        messService.deleteMenu(id, user.getHostelId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(Authentication auth, @PathVariable Long id) throws IOException {
        User user = getAuthenticatedUser(auth);
        byte[] pdf = messService.generatePdf(id, user.getHostelId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=mess_menu.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}/excel")
    public ResponseEntity<byte[]> downloadExcel(Authentication auth, @PathVariable Long id) throws IOException {
        User user = getAuthenticatedUser(auth);
        byte[] excel = messService.generateExcel(id, user.getHostelId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=mess_menu.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}
