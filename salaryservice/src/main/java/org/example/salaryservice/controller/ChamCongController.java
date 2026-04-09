package org.example.salaryservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.dto.ChamCongSummary;
import org.example.salaryservice.service.ChamCongService;
import org.example.salaryservice.repository.ChamCongRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cham-cong")
@RequiredArgsConstructor
public class ChamCongController {

    private final ChamCongService chamCongService;
    private final ChamCongRepository chamCongRepository;

    /**
     * API: Bấm nút Vào ca / Tan làm
     * Khớp với: axios.post('/api/cham-cong/thuc-hien', { maNV })
     */
    @PostMapping("/thuc-hien")
    public ResponseEntity<?> thucHienChamCong(@RequestBody Map<String, String> request) {
        try {
            String maNV = request.get("maNV");
            if (maNV == null || maNV.isEmpty()) {
                return ResponseEntity.badRequest().body("Thiếu mã nhân viên");
            }
            return ResponseEntity.ok(chamCongService.thucHienChamCong(maNV));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    /**
     * API: Lấy trạng thái hiện tại (Đang làm hay đã nghỉ)
     * Khớp với: axios.get('/api/cham-cong/status/${maNV}')
     */
    @GetMapping("/status/{maNV}")
    public ResponseEntity<?> getStatus(@PathVariable String maNV) {
        return chamCongService.layCaDangLam(maNV)
                .map(ResponseEntity::ok) // Trả về 200 kèm object ChamCong nếu đang làm
                .orElse(ResponseEntity.noContent().build()); // Trả về 204 nếu chưa vào ca
    }

    /**
     * API: Lấy danh sách các ngày đã đi làm trong tháng để tô màu lịch
     * Khớp với: axios.get('/api/cham-cong/active-days', { params: { maNV, month, year } })
     */
    @GetMapping("/active-days")
    public ResponseEntity<?> getActiveDays(
            @RequestParam String maNV,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            // Gọi hàm mới trong Repository
            List<Map<String, Object>> daysData = chamCongRepository.findActiveDaysWithHours(maNV, month, year);
            return ResponseEntity.ok(daysData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi lấy dữ liệu lịch: " + e.getMessage());
        }
    }

    /**
     * API bổ sung: Lấy danh sách chấm công chưa tính lương (nếu cần hiển thị ở trang Admin)
     */
    @GetMapping("/unpaid/{maNV}")
    public ResponseEntity<?> getUnpaid(@PathVariable String maNV) {
        return ResponseEntity.ok(chamCongRepository.findUnpaidByMaNhanVien(maNV));
    }
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam String maNV,
            @RequestParam int month,
            @RequestParam int year) {

        return ResponseEntity.ok(
                chamCongService.getHistoryByMonth(maNV, month, year)
        );
    }
}