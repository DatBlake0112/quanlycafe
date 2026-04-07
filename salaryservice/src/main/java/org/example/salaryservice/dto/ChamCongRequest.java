package org.example.salaryservice.dto; // Hoặc package tương ứng của bạn

import lombok.Data;
import java.time.LocalDateTime;

@Data // Dùng Lombok để tự tạo Getter/Setter
public class ChamCongRequest {
    private String maNV;        // Mã nhân viên (ví dụ: QL003)
    private LocalDateTime thoiGian; // Thời gian chấm công
    private String loai;        // "VÀO" hoặc "RA"
    private String ghiChu;      // Ghi chú nếu có
}