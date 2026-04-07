package com.example.quanlycafe.controller;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.repository.NhanVienRepository;
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

    // Lấy toàn bộ danh sách nhân viên trong hệ thống (Thay thế cho findByThuongHieu)
    @GetMapping
    public ResponseEntity<List<NhanVien>> getAll() {
        return ResponseEntity.ok(nhanVienService.findAll());
    }

    // Thêm nhân viên mới (Admin tạo nhân viên)
    @PostMapping
    public ResponseEntity<?> addNhanVien(@RequestBody NhanVien nv) {
        // Service sẽ tự động xử lý tạo mã nhân viên và tài khoản mặc định
        return ResponseEntity.ok(nhanVienService.addNhanVien(nv));
    }

    // Cập nhật thông tin nhân viên (Lương, Chức vụ, Ngày sinh...)
    @PutMapping("/{maNhanVien}")
    public ResponseEntity<?> updateNhanVien(@PathVariable String maNhanVien, @RequestBody NhanVien request) {
        return ResponseEntity.ok(nhanVienService.update(maNhanVien, request));
    }

    // Xóa nhân viên
    @DeleteMapping("/{maNhanVien}")
    public ResponseEntity<?> delete(@PathVariable String maNhanVien) {
        nhanVienService.delete(maNhanVien);
        return ResponseEntity.ok("Đã xóa nhân viên");
    }

    // Endpoint bổ sung: Kiểm tra sự tồn tại của nhân viên (Phục vụ SalaryService gọi sang)
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
}