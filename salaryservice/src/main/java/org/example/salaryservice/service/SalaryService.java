package org.example.salaryservice.service;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryService {
    private final ChamCongRepository chamCongRepo;
    private final LuongThuongRepository luongThuongRepo;

    @Transactional
    public void chotLuongThang(String maNV) {
        List<ChamCong> unpaidList = chamCongRepo.findUnpaidByMaNhanVien(maNV);
        for (ChamCong cc : unpaidList) {
            LuongThuong lt = new LuongThuong();
            lt.setMaPhieu("PL" + System.currentTimeMillis() % 1000000);
            lt.setMaNhanVien(maNV);
            lt.setMaChamCong(cc.getMaChamCong());
            lt.setSoTien((cc.getSoGioLam() != null ? cc.getSoGioLam() : 0) * 30000); // 30k/h
            lt.setLoaiKhoan("Lương ca làm việc");
            lt.setThangNam(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/yyyy")));
            lt.setNgayTao(LocalDateTime.now());
            lt.setTrangThaiLuong("Chưa thanh toán");

            luongThuongRepo.save(lt);
        }
    }
}