package com.example.quanlycafe.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import lombok.Data;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "NhanVien")
@Data
public class NhanVien {
    @Id
    @Column(name = "maNhanVien")
    private String maNhanVien;

    private String tenNhanVien;
    private String chucVu;
    private Double tienLuong;
    private LocalDate ngaySinh;
    private LocalDate ngayVaoLam;
    @Column(name = "trangThai")
    private String trangThai = "Đang làm";
    @Transient // Chú thích này giúp Hibernate bỏ qua không tìm cột này trong DB
    private String tenDangNhap;

    // SỬA Ở ĐÂY: Dùng mappedBy và JsonManagedReference
    @OneToOne(mappedBy = "nhanVien")
    @JsonManagedReference
    private TaiKhoan taiKhoan;

}