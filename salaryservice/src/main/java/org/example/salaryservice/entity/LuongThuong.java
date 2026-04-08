package org.example.salaryservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "LuongThuong")
@Data
public class LuongThuong {
    @Id
    private String maPhieu;
    private String maNhanVien;
    private String loaiKhoan;      // "LUONG", "THUONG", "PHAT"
    private Double soTien;
    private String thangNam;       // Định dạng "MM/yyyy"
    private String ghiChu;
    private LocalDateTime ngayTao;
    private String maChamCong;     // Dùng để đối soát với bảng ChamCong
    private String trangThaiLuong;  // "Chưa thanh toán", "Đã thanh toán", "Chờ phê duyệt"
}