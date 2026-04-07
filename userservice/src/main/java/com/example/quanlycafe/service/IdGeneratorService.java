package com.example.quanlycafe.service;

import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdGeneratorService {

    private final NhanVienRepository nhanVienRepo;
    private final TaiKhoanRepository taiKhoanRepo;

    // 2. Tạo mã Nhân Viên (QL001, NV001...)
    public String taoMaNhanVien(String loaiNhanVien) {
        String prefix = loaiNhanVien.toUpperCase(); // QL hoặc NV...
        Optional<String> lastId = nhanVienRepo.findMaxMaNhanVienByPrefix(prefix + "%");
        if (lastId.isPresent()) {
            String phanSo = lastId.get().substring(prefix.length());
            int soTiepTheo = Integer.parseInt(phanSo) + 1;
            return String.format("%s%03d", prefix, soTiepTheo);
        }
        return prefix + "001";
    }

    // 3. Tạo mã Tài Khoản (TK0001)
    public String taoMaTaiKhoan() {
        String prefix = "TK";
        Optional<String> lastId = taiKhoanRepo.findMaxMaTK();
        if (lastId.isPresent()) {
            long soTiepTheo = Long.parseLong(lastId.get().substring(2)) + 1;
            return String.format("%s%04d", prefix, soTiepTheo);
        }
        return prefix + "0001";
    }
}