package com.example.quanlycafe.service;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.entity.TaiKhoan;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final IdGeneratorService idGenerator;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public NhanVien update(String maNV, NhanVien data) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));

        // Cập nhật các trường cần thiết
        nv.setTenNhanVien(data.getTenNhanVien());
        nv.setChucVu(data.getChucVu());
        nv.setTienLuong(data.getTienLuong());
        nv.setNgaySinh(data.getNgaySinh());

        // Lưu ý: maThuongHieu thường không cho phép sửa đổi qua API này

        return nhanVienRepository.save(nv);
    }

    @Transactional
    public void delete(String maNV) {
        if (!nhanVienRepository.existsById(maNV)) {
            throw new RuntimeException("Nhân viên không tồn tại");
        }
        nhanVienRepository.deleteById(maNV);
    }

    @Transactional
    public NhanVien addNhanVien(NhanVien nv) {
        // 1. Tự động tạo mã Nhân viên (Ví dụ dựa trên chức vụ)
        String loai = nv.getChucVu().equals("Quản lý") ? "QL" : "NV";
        nv.setMaNhanVien(idGenerator.taoMaNhanVien(loai));
        nv.setNgayVaoLam(java.time.LocalDate.now());

        // 2. Lưu Nhân viên
        NhanVien savedNv = nhanVienRepository.save(nv);

        TaiKhoan tk = new TaiKhoan();
        tk.setMaTaiKhoan(idGenerator.taoMaTaiKhoan());
        tk.setTenDangNhap(nv.getTenDangNhap());
        tk.setMatKhau(passwordEncoder.encode("123456"));

        // CHUẨN HÓA ROLE Ở ĐÂY:
        String chucVu = nv.getChucVu();
        if (chucVu.equals("Quản lý")) {
            tk.setLoaiTaiKhoan("ADMIN");
        } else {
            tk.setLoaiTaiKhoan("STAFF");
        }

        tk.setNhanVien(savedNv);
        taiKhoanRepository.save(tk);

        return savedNv;
    }
    public boolean existsById(String maNhanVien) {
        return nhanVienRepository.existsById(maNhanVien);
    }
    public List<NhanVien> findAll() {
        return nhanVienRepository.findAll();
    }
}