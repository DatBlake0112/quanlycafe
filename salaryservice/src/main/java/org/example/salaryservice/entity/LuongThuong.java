package org.example.salaryservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "LuongThuong")
@Data
public class LuongThuong {
    @Id
    private String maPhieu;
    private String maNhanVien;
    private String loaiKhoan; // "Lương ca", "Thưởng"
    private Double soTien;
    private String thangNam;
    private LocalDateTime ngayTao;
    private String maChamCong; // Khóa ngoại dùng để Check trạng thái

    private String trangThaiLuong; // "Đã chốt", "Đã thanh toán"
}