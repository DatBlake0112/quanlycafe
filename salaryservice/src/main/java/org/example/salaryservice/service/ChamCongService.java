package org.example.salaryservice.service;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.dto.ChamCongDTO;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChamCongService {
    private final ChamCongRepository repo;

    public Optional<ChamCong> layCaDangLam(String maNV) {
        return repo.findByMaNhanVienAndTrangThai(maNV, "Đang làm")
                .filter(cc -> Duration.between(cc.getThoiGianVao(), LocalDateTime.now()).toHours() < 12);
    }

    @Transactional
    public ChamCong thucHienChamCong(String maNV) {
        Optional<ChamCong> caDangLam = repo.findByMaNhanVienAndTrangThai(maNV, "Đang làm");

        if (caDangLam.isPresent()) {
            ChamCong cc = caDangLam.get();
            // Nếu quên tan ca (quá 12h), đóng ca lỗi và mở ca mới
            if (Duration.between(cc.getThoiGianVao(), LocalDateTime.now()).toHours() >= 12) {
                cc.setTrangThai("Lỗi ca");
                cc.setThoiGianRa(cc.getThoiGianVao());
                cc.setSoGioLam(0.0);
                repo.save(cc);
                return checkIn(maNV);
            }
            return checkOut(cc);
        }
        return checkIn(maNV);
    }

    private ChamCong checkIn(String maNV) {
        ZonedDateTime nowZoned = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime now = nowZoned.toLocalDateTime();
        int hour = nowZoned.getHour();
        String prefix;

        if (hour >= 6 && hour < 12) {
            prefix = "S";
        } else if (hour >= 12 && hour < 18) {
            prefix = "C";
        } else if (hour >= 18 && hour < 23) {
            prefix = "T";
        } else {
            throw new RuntimeException("Hệ thống chỉ cho phép vào ca từ 06:00 đến 23:00!");
        }

        ChamCong cc = new ChamCong();
        cc.setMaChamCong("CC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        cc.setMaNhanVien(maNV);
        cc.setMaCa(prefix + now.format(DateTimeFormatter.ofPattern("ddMMyy")));
        cc.setThoiGianVao(now);
        cc.setTrangThai("Đang làm");
        return repo.save(cc);
    }

    private ChamCong checkOut(ChamCong cc) {
        cc.setThoiGianRa(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        cc.setTrangThai("Hoàn thành");
        double hours = Duration.between(cc.getThoiGianVao(), cc.getThoiGianRa()).getSeconds() / 3600.0;
        cc.setSoGioLam(Math.round(hours * 100.0) / 100.0);
        return repo.save(cc);
    }

    public List<ChamCongDTO> getHistoryByMonth(String maNV, int month, int year) {
        return repo.findByMonth(maNV, month, year)
                .stream()
                .map(cc -> new ChamCongDTO(
                        cc.getThoiGianVao().toLocalDate().toString(),
                        cc.getThoiGianVao().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                        cc.getThoiGianRa() != null ? cc.getThoiGianRa().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "--",
                        cc.getSoGioLam() != null ? cc.getSoGioLam() : 0
                ))
                .toList();
    }
    @Transactional
    public ChamCong fixCaLoi(String maNV, int d, int m, int y, String gioRaMoi) {
        // 1. Tìm bản ghi "Lỗi ca" bằng cách truyền chuỗi từ Java xuống để tránh lỗi Encoding Tiếng Việt
        // Dùng LIKE trong Repository nếu cần thiết
        ChamCong cc = repo.findErrorShift(maNV, d, m, y, "Lỗi ca")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi 'Lỗi ca' nào cho ngày " + d + "/" + m + " trong hệ thống!"));

        // 2. Chuyển "HH:mm" từ React gửi lên thành LocalDateTime
        // Sử dụng Formatter để đảm bảo an toàn
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime timeRa = LocalTime.parse(gioRaMoi, timeFormatter);

        // Giờ ra phải đi cùng ngày với giờ vào của ca đó
        LocalDateTime dateTimeRa = LocalDateTime.of(cc.getThoiGianVao().toLocalDate(), timeRa);

        // 3. Kiểm tra logic thời gian
        if (dateTimeRa.isBefore(cc.getThoiGianVao())) {
            throw new RuntimeException("Giờ ra (" + gioRaMoi + ") không được sớm hơn giờ vào (" +
                    cc.getThoiGianVao().format(DateTimeFormatter.ofPattern("HH:mm")) + ")!");
        }

        // 4. Cập nhật thông tin
        cc.setThoiGianRa(dateTimeRa);
        cc.setTrangThai("Hoàn thành");

        // Tính lại số giờ làm
        double hours = Duration.between(cc.getThoiGianVao(), dateTimeRa).getSeconds() / 3600.0;
        cc.setSoGioLam(Math.round(hours * 100.0) / 100.0);

        return repo.save(cc);
    }
}