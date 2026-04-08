package org.example.salaryservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.salaryservice.repository.LuongThuongRepository;
import org.example.salaryservice.service.SalaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SalaryController {

    private final SalaryService salaryService;
    private final LuongThuongRepository luongThuongRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam String thangNam) {
        // Tách chuỗi MM/yyyy để lấy tháng và năm
        int month = Integer.parseInt(thangNam.split("/")[0]);
        int year = Integer.parseInt(thangNam.split("/")[1]);

        Map<String, Object> stats = new HashMap<>();

        // Lấy các tổng tiền
        Double tongLuong = luongThuongRepository.sumTotalSalary(thangNam);
        Double tongThuong = luongThuongRepository.sumTotalBonus(thangNam);
        Double tongKhauTru = luongThuongRepository.sumTotalDeduct(thangNam);

        // Gọi hàm đếm nhân viên chưa tính lương mới thêm vào
        Long nvChuaTinh = luongThuongRepository.countEmployeesNotYetCalculated(month, year);

        stats.put("tongLuong", tongLuong != null ? tongLuong : 0);
        stats.put("tongThuong", tongThuong != null ? tongThuong : 0);
        stats.put("tongKhauTru", tongKhauTru != null ? tongKhauTru : 0);
        stats.put("nvChuaTinh", nvChuaTinh != null ? nvChuaTinh : 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(@RequestParam String thangNam) {
        return ResponseEntity.ok(luongThuongRepository.findByThangNam(thangNam));
    }

    @PostMapping("/calculate-all")
    public ResponseEntity<?> calculate(@RequestBody Map<String, String> req) {
        salaryService.tinhLuongDongLoat(req.get("thangNam"));
        return ResponseEntity.ok("Thành công");
    }
    @PutMapping("/pay/{maPhieu}")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable String maPhieu) {
        try {
            // 1. Tìm đối tượng trước
            java.util.Optional<org.example.salaryservice.entity.LuongThuong> ltOpt = luongThuongRepository.findById(maPhieu);

            // 2. Kiểm tra nếu không tồn tại thì return lỗi luôn (Kiểu String)
            if (ltOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy phiếu lương với mã: " + maPhieu);
            }

            // 3. Nếu tồn tại thì xử lý cập nhật
            org.example.salaryservice.entity.LuongThuong lt = ltOpt.get();
            lt.setTrangThaiLuong("Đã thanh toán");
            luongThuongRepository.save(lt);

            // 4. Trả về thành công (Kiểu Map)
            Map<String, String> response = new HashMap<>();
            response.put("message", "Thanh toán thành công");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
    }
