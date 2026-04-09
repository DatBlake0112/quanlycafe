package com.example.quanlycafe.controller;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.service.JwtService;
import com.example.quanlycafe.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhan-vien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;
    private final NhanVienRepository nhanVienRepository;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<NhanVien>> getAll() {
        return ResponseEntity.ok(nhanVienService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addNhanVien(@RequestBody NhanVien nv) {
        // Service sẽ tự động xử lý tạo mã nhân viên và tài khoản mặc định
        return ResponseEntity.ok(nhanVienService.addNhanVien(nv));
    }

    @PutMapping("/{maNhanVien}")
    public ResponseEntity<?> updateNhanVien(@PathVariable String maNhanVien, @RequestBody NhanVien request) {
        return ResponseEntity.ok(nhanVienService.update(maNhanVien, request));
    }

    @DeleteMapping("/{maNhanVien}")
    public ResponseEntity<?> delete(@PathVariable String maNhanVien) {
        nhanVienService.delete(maNhanVien);
        return ResponseEntity.ok("Đã xóa nhân viên");
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
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String token) {
        try {
            // Cắt bỏ "Bearer " để lấy JWT
            String jwt = token.substring(7);
            String username = jwtService.extractUsername(jwt);

            return nhanVienService.getNhanVienByUsername(username)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Lỗi xác thực: " + e.getMessage());
        }
    }
}
