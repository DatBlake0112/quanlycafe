package com.example.quanlycafe.controller;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhan-vien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;
    private final NhanVienRepository nhanVienRepository;

    @GetMapping
    public ResponseEntity<List<NhanVien>> getAll() {
        return ResponseEntity.ok(nhanVienService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addNhanVien(@RequestBody NhanVien nv) {
        return ResponseEntity.ok(nhanVienService.addNhanVien(nv));
    }

    @PutMapping("/{maNhanVien}")
    public ResponseEntity<?> updateNhanVien(@PathVariable String maNhanVien, @RequestBody NhanVien request) {
        return ResponseEntity.ok(nhanVienService.update(maNhanVien, request));
    }

    @DeleteMapping("/{maNhanVien}")
    public ResponseEntity<?> delete(@PathVariable String maNhanVien) {
        nhanVienService.delete(maNhanVien);
        return ResponseEntity.ok("Da xoa nhan vien");
    }

    @GetMapping("/exists/{maNhanVien}")
    public ResponseEntity<Boolean> exists(@PathVariable String maNhanVien) {
        return ResponseEntity.ok(nhanVienService.existsById(maNhanVien));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanVien> getById(@PathVariable String id) {
        return nhanVienRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return nhanVienService.getNhanVienByUsername(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
