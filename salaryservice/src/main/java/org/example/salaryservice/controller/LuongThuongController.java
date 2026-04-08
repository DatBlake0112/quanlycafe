package org.example.salaryservice.controller;

import org.example.salaryservice.entity.LuongThuong;
import org.example.salaryservice.service.LuongThuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LuongThuongController {

    @Autowired
    private LuongThuongService service;

    @GetMapping("/all")
    public List<LuongThuong> getAll(@RequestParam Integer thang, @RequestParam Integer nam) {
        return service.getByMonth(thang, nam);
    }

    @PostMapping("/adjustment")
    public ResponseEntity<LuongThuong> createAdj(@RequestBody LuongThuong req) {
        return ResponseEntity.ok(service.addAdjustment(req));
    }

    @PutMapping("/pay/{maNV}")
    public ResponseEntity<String> pay(@PathVariable String maNV, @RequestParam Integer thang, @RequestParam Integer nam) {
        service.updatePaymentStatus(maNV, thang, nam);
        return ResponseEntity.ok("Thành công");
    }
    @PostMapping("/calculate-all")
    public ResponseEntity<String> calculateAll(@RequestBody Map<String, Integer> request) {
        try {
            Integer thang = request.get("thang");
            Integer nam = request.get("nam");

            if (thang == null || nam == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin tháng hoặc năm");
            }

            service.tinhLuongDongLoat(thang, nam);

            return ResponseEntity.ok("Đã tổng hợp lương thành công cho tháng " + thang + "/" + nam);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi Server: " + e.getMessage());
        }
        }

    @PostMapping("/create")
    public ResponseEntity<?> createAdjustment(@RequestBody LuongThuong adjustment) {
        try {
            LuongThuong saved = service.saveAdjustment(adjustment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi lưu điều chỉnh: " + e.getMessage());
        }
    }
    }
