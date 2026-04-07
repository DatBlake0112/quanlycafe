package org.example.salaryservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.example.salaryservice.service.SalaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SalaryController {

    private final SalaryService salaryService;
    private final LuongThuongRepository luongThuongRepository;

    /**
     * API 1: Lấy dữ liệu thống kê cho 4 thẻ màu phía trên (Card Stats)
     * GET /api/salary/stats?thangNam=04/2026
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSalaryStats(@RequestParam String thangNam) {
        List<LuongThuong> list = luongThuongRepository.findByThangNam(thangNam);

        double tongLuong = list.stream().mapToDouble(l -> l.getThucNhan() != null ? l.getThucNhan() : 0).sum();
        double tongThuong = list.stream().mapToDouble(l -> l.getThuong() != null ? l.getThuong() : 0).sum();
        double tongKhauTru = list.stream().mapToDouble(l -> l.getKhauTru() != null ? l.getKhauTru() : 0).sum();
        long nvChuaTinh = 2; // Giả lập hoặc đếm số NV chưa có trong list

        Map<String, Object> stats = new HashMap<>();
        stats.put("tongLuong", tongLuong);
        stats.put("tongThuong", tongThuong);
        stats.put("tongKhauTru", tongKhauTru);
        stats.put("nvChuaTinh", nvChuaTinh);

        return ResponseEntity.ok(stats);
    }

    /**
     * API 2: Lấy toàn bộ bảng lương chi tiết
     * GET /api/salary/all?thangNam=04/2026
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllSalary(@RequestParam String thangNam) {
        return ResponseEntity.ok(luongThuongRepository.findByThangNam(thangNam));
    }

    /**
     * API 3: Nút "TÍNH LƯƠNG ĐỒNG LOẠT"
     * POST /api/salary/calculate-all
     */
    @PostMapping("/calculate-all")
    public ResponseEntity<?> calculateAll(@RequestBody Map<String, String> request) {
        String thangNam = request.get("thangNam");
        // Gọi service xử lý logic quét ChamCong và đổ vào LuongThuong
        salaryService.tinhLuongDongLoat(thangNam);
        return ResponseEntity.ok("Đã tính lương đồng loạt cho tháng " + thangNam);
    }

    /**
     * API 4: Nút "Thanh toán" từng dòng
     * PATCH /api/salary/pay/{maPhieu}
     */
    @PatchMapping("/pay/{maPhieu}")
    public ResponseEntity<?> updateStatus(@PathVariable String maPhieu) {
        return luongThuongRepository.findById(maPhieu)
                .map(lt -> {
                    lt.setTrangThaiLuong("Đã thanh toán");
                    luongThuongRepository.save(lt);
                    return ResponseEntity.ok("Thanh toán thành công");
                }).orElse(ResponseEntity.notFound().build());
    }
}