package org.example.salaryservice.service;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
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
        ChamCong cc = new ChamCong();
        cc.setMaChamCong("CC" + System.currentTimeMillis() % 100000);
        cc.setMaNhanVien(maNV);
        cc.setThoiGianVao(LocalDateTime.now());
        cc.setTrangThai("Đang làm");
        return repo.save(cc);
    }

    private ChamCong checkOut(ChamCong cc) {
        cc.setThoiGianRa(LocalDateTime.now());
        cc.setTrangThai("Hoàn thành");
        if (cc.getThoiGianVao() != null) {
            long mins = Duration.between(cc.getThoiGianVao(), cc.getThoiGianRa()).toMinutes();
            cc.setSoGioLam(mins / 60.0);
        }
        return repo.save(cc);
    }
}