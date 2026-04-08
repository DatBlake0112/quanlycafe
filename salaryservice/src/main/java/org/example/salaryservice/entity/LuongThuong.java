package org.example.salaryservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class LuongThuong {
    @Id
    private String maPhieu;
    private String maNhanVien;
    private String loaiPhieu;
    private Double soTien;
    private Double soGioLam;
    private Integer thang;
    private Integer nam;
    private String trangThaiLuong;
    private String ghiChu;
    private LocalDateTime ngayTao;
}