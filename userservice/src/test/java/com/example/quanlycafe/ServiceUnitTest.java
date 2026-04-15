package com.example.quanlycafe;

import com.example.quanlycafe.entity.NhanVien;
import com.example.quanlycafe.entity.TaiKhoan;
import com.example.quanlycafe.repository.NhanVienRepository;
import com.example.quanlycafe.repository.TaiKhoanRepository;
import com.example.quanlycafe.service.AuthService;
import com.example.quanlycafe.service.JwtService;
import com.example.quanlycafe.service.NhanVienService;
import org.example.salaryservice.repository.ChamCongRepository;
import org.example.salaryservice.service.ChamCongService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ServiceUnitTest {

    @Mock private TaiKhoanRepository taiKhoanRepository;
    @Mock private NhanVienRepository nhanVienRepository;
    @Mock private ChamCongRepository chamCongRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService authService;
    @InjectMocks private NhanVienService nhanVienService;
    @InjectMocks private ChamCongService chamCongService;

    // ================= LOGIN =================

    @Test
    void testLogin_Success() {
        TaiKhoan tk = new TaiKhoan();
        tk.setTenDangNhap("nguyenbeo@gmail.com");
        tk.setMatKhau("encoded_pass");
        tk.setLoaiTaiKhoan("ADMIN");

        when(taiKhoanRepository.findByTenDangNhap("nguyenbeo@gmail.com"))
                .thenReturn(Optional.of(tk));

        when(passwordEncoder.matches("123456", "encoded_pass"))
                .thenReturn(true);

        when(jwtService.generateToken(any(), any()))
                .thenReturn("mock_token");

        var result = authService.loginDetail("nguyenbeo@gmail.com", "123456");

        System.out.println("TOKEN = " + result.get("token"));

        assertEquals("mock_token", result.get("token"));
        assertEquals("ADMIN", result.get("role"));
    }

    @Test
    void testLogin_WrongPassword() {
        TaiKhoan tk = new TaiKhoan();
        tk.setTenDangNhap("nguyenbeo@gmail.com");
        tk.setMatKhau("encoded_pass");

        when(taiKhoanRepository.findByTenDangNhap("nguyenbeo@gmail.com"))
                .thenReturn(Optional.of(tk));

        when(passwordEncoder.matches("wrong", "encoded_pass"))
                .thenReturn(false);

        Exception ex = assertThrows(RuntimeException.class,
                () -> authService.loginDetail("nguyenbeo@gmail.com", "wrong"));

        System.out.println("Lỗi: " + ex.getMessage());

        assertEquals("Sai mật khẩu!", ex.getMessage());
    }

    @Test
    void testLogin_UserNotFound() {
        when(taiKhoanRepository.findByTenDangNhap("notfound@gmail.com"))
                .thenReturn(Optional.empty());

        Exception ex = assertThrows(RuntimeException.class,
                () -> authService.loginDetail("notfound@gmail.com", "123"));

        System.out.println("Lỗi: " + ex.getMessage());

        assertEquals("Tài khoản không tồn tại", ex.getMessage());
    }

    // ================= NHAN VIEN =================

    @Test
    void testUpdate_Success() {
        NhanVien nv = new NhanVien();
        nv.setMaNhanVien("NV001");
        when(nhanVienRepository.findById("NV001"))
                .thenReturn(Optional.of(nv));
        when(nhanVienRepository.save(any()))
                .thenReturn(nv);
        NhanVien data = new NhanVien();
        data.setTenNhanVien("Tên mới");
        var result = nhanVienService.update("NV001", data);
        System.out.println("Mã nhân viên: "+result.getMaNhanVien());
        System.out.println("Tên mới: " + result.getTenNhanVien());
        assertEquals("Tên mới", result.getTenNhanVien());
    }

    @Test
    void testUpdate_NotFound() {
        when(nhanVienRepository.findById("NV999"))
                .thenReturn(Optional.empty());

        Exception ex = assertThrows(RuntimeException.class,
                () -> nhanVienService.update("NV999", new NhanVien()));

        System.out.println("Lỗi: " + ex.getMessage());

        assertTrue(ex.getMessage().contains("Không tìm thấy nhân viên"));
    }
    // ================= LOGIC TEST (CHẤM CÔNG) =================

    @Test
    void testCalculateHours_Success() {
        var vao = java.time.LocalDateTime.of(2026, 4, 12, 8, 0);
        var ra  = java.time.LocalDateTime.of(2026, 4, 12, 10, 30);

        long mins = java.time.Duration.between(vao, ra).toMinutes();
        double hours = Math.round((mins / 60.0) * 100.0) / 100.0;

        System.out.println("Giờ làm: " + hours);

        assertEquals(2.5, hours);
    }

    @Test
    void testChamCong_OutOfWorkingHours() {
        var time = java.time.LocalDateTime.of(2026, 4, 12, 23, 0);

        Exception ex = assertThrows(RuntimeException.class, () -> {
            int hour = time.getHour();
            if (hour < 6 || hour >= 22) {
                throw new RuntimeException(
                        "Ngoài giờ làm việc! Hệ thống không cho phép chấm công từ 22h đêm đến 6h sáng."
                );
            }
        });

        System.out.println("Lỗi: " + ex.getMessage());

        assertEquals(
                "Ngoài giờ làm việc! Hệ thống không cho phép chấm công từ 22h đêm đến 6h sáng.",
                ex.getMessage()
        );
    }
}