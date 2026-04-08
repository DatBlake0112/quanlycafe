package org.example.salaryservice.service;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.dto.NhanVienDTO;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryService {
    private final ChamCongRepository chamCongRepo;
    private final LuongThuongRepository luongThuongRepo;
    private final RestTemplate restTemplate = new RestTemplate(); // Dùng để gọi API ngoại

    @Transactional
    public void tinhLuongDongLoat(String thangNam) {
        // 1. Gọi API sang User Service (8081) để lấy danh sách nhân viên thực tế
        String url = "http://localhost:8081/api/nhan-vien";
        NhanVienDTO[] nhanViens = restTemplate.getForObject(url, NhanVienDTO[].class);

        if (nhanViens == null) return;

        // 2. Duyệt qua từng nhân viên lấy được từ DB của User Service
        for (NhanVienDTO nv : nhanViens) {
            String maNV = nv.getMaNhanVien();
            // Lấy mức lương thực tế từ bảng NhanVien (ví dụ: 45000 cho QL003)
            double mucLuongHienTai;
            if (nv.getTienLuong() != null && nv.getTienLuong() > 0) {
                mucLuongHienTai = nv.getTienLuong().doubleValue(); // Chuyển Float sang double
            } else {
                mucLuongHienTai = 30000.0; // Mức lương "chữa cháy" nếu dữ liệu lỗi
            }

            // 3. Tìm các ca chưa tính tiền của nhân viên này
            List<ChamCong> listCC = chamCongRepo.findUnpaidByMaNhanVien(maNV);

            for (ChamCong cc : listCC) {
                LuongThuong lt = new LuongThuong();
                lt.setMaPhieu("PL" + System.currentTimeMillis() % 1000000);
                lt.setMaNhanVien(maNV);
                lt.setLoaiKhoan("LUONG");

                // 4. TÍNH TOÁN: Số giờ làm * Mức lương thực tế lấy từ API
                double soGio = (cc.getSoGioLam() != null ? cc.getSoGioLam() : 0);
                lt.setSoTien(soGio * mucLuongHienTai);

                lt.setThangNam(thangNam);
                lt.setMaChamCong(cc.getMaChamCong());
                lt.setTrangThaiLuong("Chưa thanh toán");
                lt.setNgayTao(LocalDateTime.now());

                luongThuongRepo.save(lt);
            }
        }
    }
}