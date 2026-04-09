package org.example.salaryservice.service;

import jakarta.transaction.Transactional;
import org.example.salaryservice.dto.NhanVienDTO;
import org.example.salaryservice.entity.ChamCong;
import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.repository.ChamCongRepository;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        // Tự sinh mã phiếu dựa trên loại: T (Thưởng), P (Phạt)
        String prefix = "THUONG".equalsIgnoreCase(req.getLoaiPhieu()) ? "T" : "P";
        String ma = prefix + System.currentTimeMillis() % 1000000;

        req.setMaPhieu(ma);
        req.setNgayTao(LocalDateTime.now());
        req.setTrangThaiLuong("Chưa thanh toán");

        // Nếu không phải phiếu lương thì số giờ làm = 0
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
    public void tinhLuongDongLoat(Integer thang, Integer nam) {
        String url = "http://localhost:8081/api/nhan-vien";
        NhanVienDTO[] nhanViens = restTemplate.getForObject(url, NhanVienDTO[].class);

        if (nhanViens == null) return;

        for (NhanVienDTO nv : nhanViens) {
            String maNV = nv.getMaNhanVien();

            // 1. Kiểm tra xem tháng này NV đã có phiếu lương chưa (Theo cái Unique Constraint của bạn)
            // Nếu đã có rồi thì bỏ qua luôn nhân viên này, không tính lại nữa
            if (repository.existsByMaNhanVienAndThangAndNamAndLoaiPhieu(maNV, thang, nam, "LUONG")) {
                System.out.println("NV " + maNV + " đã được tính lương tháng này rồi. Bỏ qua.");
                continue;
            }

            // 2. Lấy tất cả ca chấm công của NV trong tháng/năm này
            // Bạn cần viết thêm hàm này trong ChamCongRepository
            List<ChamCong> listCCInMonth = chamCongRepo.findByMaNhanVienAndThangAndNam(maNV, thang, nam);


            if (listCCInMonth.isEmpty()) continue;

            // 3. Tính tổng số giờ làm trong tháng
            double tongGioLam = listCCInMonth.stream()
                    .mapToDouble(cc -> cc.getSoGioLam() != null ? cc.getSoGioLam() : 0.0)
                    .sum();

                // 4. Tạo Entity mới khớp hoàn toàn với DB hiện tại của bạn
            double mucLuong = (nv.getTienLuong() != null) ? nv.getTienLuong().doubleValue() : 30000.0;

            LuongThuong lt = new LuongThuong();
            lt.setMaPhieu("PL" + (System.nanoTime() % 10000000));
            lt.setMaNhanVien(maNV);
            lt.setLoaiPhieu("LUONG");
            lt.setSoGioLam(tongGioLam);
            lt.setSoTien(tongGioLam * mucLuong);
            lt.setThang(thang);
            lt.setNam(nam);
            lt.setTrangThaiLuong("Chưa thanh toán");
            lt.setNgayTao(LocalDateTime.now());

            repository.save(lt);
            }
        }
    public LuongThuong saveAdjustment(LuongThuong adjustment) {
        if (adjustment.getMaPhieu() == null || adjustment.getMaPhieu().isEmpty()) {
            adjustment.setMaPhieu("ADJ" + System.nanoTime());
        }
        adjustment.setNgayTao(LocalDateTime.now());
        adjustment.setTrangThaiLuong("Chưa thanh toán");
        // loaiPhieu sẽ do Frontend gửi lên (THUONG hoặc PHAT)
        return repository.save(adjustment);
    }
    }
