package com.example.quanlycafe.service;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.entity.TaiKhoan;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final IdGeneratorService idGenerator;
    private final PasswordEncoder passwordEncoder;

    // Khởi tạo RestTemplate (Hoặc inject từ Config nếu bạn đã tạo Bean)
    private final RestTemplate restTemplate = new RestTemplate();

    // 1. LẤY DANH SÁCH: Chỉ lấy người đang làm
    public List<NhanVien> findAll() {
        // Giả sử bạn đã thêm findByTrangThai vào Repository
        return nhanVienRepository.findByTrangThai("Đang làm");
    }

    @Transactional
    public void delete(String maNV, String token) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        // GỌI SANG SALARY-SERVICE ĐỂ KIỂM TRA LỊCH SỬ
        boolean coLichSu = false;
        try {
            String url = "http://localhost:8085/api/salary/check-history/" + maNV;
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, token);

            ResponseEntity<Boolean> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), Boolean.class
            );
            coLichSu = Boolean.TRUE.equals(response.getBody());
        } catch (Exception e) {
            // Nếu Service bên kia sập, mặc định xóa mềm để an toàn cho DB
            coLichSu = true;
        }

        // Luôn xóa tài khoản để họ không thể đăng nhập
        taiKhoanRepository.findByNhanVienMaNhanVien(maNV).ifPresent(taiKhoanRepository::delete);

        if (coLichSu) {
            // TRƯỜNG HỢP 1: CÓ DỮ LIỆU SINH -> XÓA MỀM
            nv.setTrangThai("Đã nghỉ");
            nhanVienRepository.save(nv);
        } else {
            // TRƯỜNG HỢP 2: CHƯA CÓ DỮ LIỆU -> XÓA CỨNG
            nhanVienRepository.delete(nv);
        }
    }

    @Transactional
    public NhanVien addNhanVien(NhanVien nv) {
        String loai = "Quản lý".equals(nv.getChucVu()) ? "QL" : "NV";
        nv.setMaNhanVien(idGenerator.taoMaNhanVien(loai));
        nv.setNgayVaoLam(java.time.LocalDate.now());

        // Luôn set trạng thái mặc định khi thêm mới
        nv.setTrangThai("Đang làm");

        NhanVien savedNv = nhanVienRepository.save(nv);

        TaiKhoan tk = new TaiKhoan();
        tk.setMaTaiKhoan(idGenerator.taoMaTaiKhoan());
        tk.setTenDangNhap(nv.getTenDangNhap());
        tk.setMatKhau(passwordEncoder.encode("123456"));

        String chucVu = nv.getChucVu();
        tk.setLoaiTaiKhoan("Quản lý".equals(chucVu) ? "ADMIN" : "STAFF");

        tk.setNhanVien(savedNv);
        taiKhoanRepository.save(tk);

        return savedNv;
    }

    @Transactional
    public NhanVien update(String maNV, NhanVien data) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));

        if (data.getTenNhanVien() == null || data.getTenNhanVien().isBlank()) {
            throw new RuntimeException("Tên nhân viên không được để trống");
        }

        nv.setTenNhanVien(data.getTenNhanVien());
        nv.setChucVu(data.getChucVu());
        nv.setTienLuong(data.getTienLuong());
        nv.setNgaySinh(data.getNgaySinh());

        return nhanVienRepository.save(nv);
    }

    public boolean existsById(String maNhanVien) {
        return nhanVienRepository.existsById(maNhanVien);
    }

    public Optional<NhanVien> getNhanVienByUsername(String username) {
        return nhanVienRepository.findByUsernameFromAccount(username);
    }

}