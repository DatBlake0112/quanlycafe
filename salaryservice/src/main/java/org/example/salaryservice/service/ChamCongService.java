package org.example.salaryservice.service;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.dto.ChamCongDTO;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChamCongService {
    private final ChamCongRepository repo;

    public Optional<ChamCong> layCaDangLam(String maNV) {
        return repo.findByMaNhanVienAndTrangThai(maNV, "Đang làm");
    }

    @Transactional
    public ChamCong thucHienChamCong(String maNV) {
        return repo.findByMaNhanVienAndTrangThai(maNV, "Đang làm")
                .map(this::checkOut)
                .orElseGet(() -> checkIn(maNV));
    }

    private ChamCong checkIn(String maNV) {
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        String prefix;

        // 1. Phân loại ca làm việc dựa trên giờ vào
        if (hour >= 6 && hour < 12) {
            prefix = "S"; // Ca Sáng
        } else if (hour >= 12 && hour < 18) {
            prefix = "C"; // Ca Chiều
        } else if (hour >= 18 && hour < 22) {
            prefix = "T"; // Ca Tối
        } else {
            // 2. Chặn ca đêm (22h đêm đến 6h sáng hôm sau)
            throw new RuntimeException("Ngoài giờ làm việc! Hệ thống không cho phép chấm công từ 22h đêm đến 6h sáng.");
        }

        // 3. Tạo mã ca theo motip: [Prefix][ddMMyyyy] -> VD: C08042026
        String maCaTuDong = prefix + now.format(DateTimeFormatter.ofPattern("ddMMyyyy"));

        ChamCong cc = new ChamCong();
        cc.setMaChamCong("CC" + System.currentTimeMillis() % 100000);
        cc.setMaNhanVien(maNV);
        cc.setMaCa(maCaTuDong); // Gán mã ca tự động sinh ra
        cc.setThoiGianVao(now);
        cc.setTrangThai("Đang làm");
        return repo.save(cc);
    }

    private ChamCong checkOut(ChamCong cc) {
        cc.setThoiGianRa(LocalDateTime.now());
        cc.setTrangThai("Hoàn thành");
        if (cc.getThoiGianVao() != null) {
            long mins = Duration.between(cc.getThoiGianVao(), cc.getThoiGianRa()).toMinutes();
            // Tính số giờ và làm tròn đến 2 chữ số thập phân
            double hours = mins / 60.0;
            cc.setSoGioLam(Math.round(hours * 100.0) / 100.0);
        }
        return repo.save(cc);
    }

    public Double getTongGioLamTheoThang(String maNV, int thang, int nam) {
        Double tong = repo.sumSoGioLamByMonth(maNV, thang, nam);
        return (tong != null) ? tong : 0.0;
    }
    public List<ChamCongDTO> getHistoryByMonth(String maNV, int month, int year) {
        return repo.findByMonth(maNV, month, year)
                .stream()
                .map(cc -> new ChamCongDTO(
                        // 👉 Lấy ngày từ thoiGianVao
                        cc.getThoiGianVao().toLocalDate().toString(),
                        // 👉 Giờ vào
                        cc.getThoiGianVao().toLocalTime().toString(),
                        // 👉 Giờ ra (có thể null)
                        cc.getThoiGianRa() != null
                                ? cc.getThoiGianRa().toLocalTime().toString()
                                : "--",
                        // 👉 Số giờ
                        cc.getSoGioLam() != null ? cc.getSoGioLam() : 0
                ))
                .toList();
    }
}