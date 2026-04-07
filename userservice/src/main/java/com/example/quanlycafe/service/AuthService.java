package com.example.quanlycafe.service;

import com.example.quanlycafe.dto.RegisterRequest;
import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.entity.TaiKhoan;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final IdGeneratorService idGenerator;

    /**
     * LOGIC REGISTER: Tạo Thương hiệu -> Tạo Nhân viên Quản lý -> Tạo Tài khoản Admin
     */
    @Transactional
    public String register(RegisterRequest request) {
        // 1. Kiểm tra tên đăng nhập (Username) đã tồn tại chưa
        if (taiKhoanRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // 2. Tạo thông tin Nhân viên (Người quản lý)
        NhanVien nv = new NhanVien();
        String maMoi = idGenerator.taoMaNhanVien("QL");
        nv.setMaNhanVien(maMoi);
        nv.setTenNhanVien(request.getTenNhanVien());
        nv.setNgaySinh(request.getNgaySinh());
        nv.setChucVu("Quản lý");
        nv.setTienLuong(0.0); // Mặc định 0, có thể cập nhật sau
        nv.setNgayVaoLam(LocalDate.now());

        // Lưu nhân viên trước để lấy object liên kết cho tài khoản
        NhanVien savedNv = nhanVienRepository.save(nv);

        // 3. Tạo Tài khoản liên kết (ADMIN)
        TaiKhoan tk = new TaiKhoan();
        String tkmoi = idGenerator.taoMaTaiKhoan();
        tk.setMaTaiKhoan(tkmoi);
        tk.setTenDangNhap(request.getTenDangNhap());
        tk.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        tk.setLoaiTaiKhoan("ADMIN");
        tk.setNhanVien(savedNv); // Liên kết với nhân viên vừa tạo

        taiKhoanRepository.save(tk);

        return "Đăng ký tài khoản quản lý thành công";
    }

    /**
     * LOGIN: Trả về Token và thông tin cơ bản để React lưu vào localStorage
     */
    public Map<String, Object> loginDetail(String username, String password) {
        TaiKhoan tk = taiKhoanRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(password, tk.getMatKhau())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        // Tạo JWT Token
        String token = jwtService.generateToken(tk.getTenDangNhap(), tk.getLoaiTaiKhoan());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", tk.getLoaiTaiKhoan());

        // Lấy thông tin từ bảng nhân viên để hiển thị trên Sidebar React
        if (tk.getNhanVien() != null) {
            response.put("maNhanVien", tk.getNhanVien().getMaNhanVien());
            response.put("tenNhanVien", tk.getNhanVien().getTenNhanVien());
        }

        return response;
    }


    /**
     * QUÊN MẬT KHẨU: Gửi OTP (giả lập qua Console)
     */
    @Transactional
    public String sendOTP(String email) {
        TaiKhoan tk = taiKhoanRepository.findByTenDangNhap(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        int otp = (int)(Math.random() * 900000) + 100000;
        tk.setOTP(otp);
        taiKhoanRepository.save(tk);

        System.out.println(">>> MÃ OTP CỦA BẠN LÀ: " + otp);
        return "Mã OTP đã được gửi đến email của bạn.";
    }
    @Transactional
    public String verifyOTP(String email, int otp) {
        TaiKhoan tk = taiKhoanRepository.findByTenDangNhap(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (tk.getOTP() == null || tk.getOTP() != otp) {
            throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        return "OTP hợp lệ";
    }

    @Transactional
    public String resetPassword(String email, int otp, String newPass) {
        TaiKhoan tk = taiKhoanRepository.findByTenDangNhap(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (tk.getOTP() == null || tk.getOTP() != otp) {
            throw new RuntimeException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        tk.setMatKhau(passwordEncoder.encode(newPass)); // Mã hóa mật khẩu mới
        tk.setOTP(null); // Xóa OTP sau khi dùng thành công
        taiKhoanRepository.save(tk);

        return "Đổi mật khẩu thành công.";
    }
}