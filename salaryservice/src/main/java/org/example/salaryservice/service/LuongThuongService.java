package org.example.salaryservice.service;

import jakarta.transaction.Transactional;
import org.example.salaryservice.dto.NhanVienDTO;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LuongThuongService {

    @Autowired
    private LuongThuongRepository repository;

    @Autowired
    private ChamCongRepository chamCongRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<LuongThuong> getByMonth(Integer t, Integer n) {
        return repository.findByThangAndNam(t, n);
    }

    public LuongThuong addAdjustment(LuongThuong req) {
        String prefix = "THUONG".equalsIgnoreCase(req.getLoaiPhieu()) ? "T" : "P";
        String ma = prefix + System.currentTimeMillis() % 1000000;

        req.setMaPhieu(ma);
        req.setNgayTao(LocalDateTime.now());
        req.setTrangThaiLuong("Chưa thanh toán");

        if (!"LUONG".equalsIgnoreCase(req.getLoaiPhieu())) {
            req.setSoGioLam(0.0);
        }
        return repository.save(req);
    }

    public void updatePaymentStatus(String maNV, Integer t, Integer n) {
        List<LuongThuong> list = repository.findByMaNhanVienAndThangAndNam(maNV, t, n);
        for (LuongThuong item : list) {
            item.setTrangThaiLuong("Đã thanh toán");
        }
        repository.saveAll(list);
    }

    @Transactional
    public void tinhLuongDongLoat(Integer thang, Integer nam, String authorizationHeader) {
        String url = "http://localhost:8086/api/nhan-vien";
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);

        ResponseEntity<NhanVienDTO[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                NhanVienDTO[].class
        );
        NhanVienDTO[] nhanViens = response.getBody();

        if (nhanViens == null) {
            return;
        }

        for (NhanVienDTO nv : nhanViens) {
            String maNV = nv.getMaNhanVien();
            // 1. Lấy tất cả chấm công
            List<ChamCong> listCCInMonth = chamCongRepo.findByMaNhanVienAndThangAndNam(maNV, thang, nam);
            if (listCCInMonth.isEmpty()) continue;
            double tongGioLam = listCCInMonth.stream()
                    .mapToDouble(cc -> cc.getSoGioLam() != null ? cc.getSoGioLam() : 0.0)
                    .sum();

            double mucLuong = nv.getTienLuong() != null ? nv.getTienLuong().doubleValue() : 30000.0;
            // 2. Tìm phiếu cũ
            List<LuongThuong> existingRecords = repository.findByMaNhanVienAndThangAndNam(maNV, thang, nam);
            LuongThuong lt = existingRecords.stream()
                    .filter(r -> "LUONG".equalsIgnoreCase(r.getLoaiPhieu()))
                    .findFirst()
                    .orElse(new LuongThuong());

            // 3. Kiểm tra trạng thái: Nếu đã thanh toán thì TUYỆT ĐỐI không tính lại
            if ("Đã thanh toán".equals(lt.getTrangThaiLuong())) {
                continue;
            }
            // 4. Thiết lập thông tin
            if (lt.getMaPhieu() == null) {
                // Chỉ set các thông tin này cho PHIẾU MỚI
                lt.setMaPhieu("PL" + (System.nanoTime() % 10000000));
                lt.setNgayTao(LocalDateTime.now());
                lt.setMaNhanVien(maNV);
                lt.setLoaiPhieu("LUONG");
                lt.setThang(thang);
                lt.setNam(nam);
            }
            // Cập nhật các giá trị có thể thay đổi (Số giờ, số tiền)
            lt.setSoGioLam(tongGioLam);
            lt.setSoTien(tongGioLam * mucLuong);
            lt.setTrangThaiLuong("Chưa thanh toán");

            repository.save(lt);
        }
    }

    public LuongThuong saveAdjustment(LuongThuong adjustment) {
        if (adjustment.getMaPhieu() == null || adjustment.getMaPhieu().isEmpty()) {
            adjustment.setMaPhieu("ADJ" + System.nanoTime());
        }
        adjustment.setNgayTao(LocalDateTime.now());
        adjustment.setTrangThaiLuong("Chưa thanh toán");
        return repository.save(adjustment);
    }
}
