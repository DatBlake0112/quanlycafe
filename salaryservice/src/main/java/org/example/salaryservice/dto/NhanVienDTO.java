package org.example.salaryservice.dto;

import lombok.Data;

@Data
public class NhanVienDTO {
    private String maNhanVien;
    private String tenNhanVien;
    private Float tienLuong; // Đây chính là mức lương/giờ (45k hoặc 30k)
}