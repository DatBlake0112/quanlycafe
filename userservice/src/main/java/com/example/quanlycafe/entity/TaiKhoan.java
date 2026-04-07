package com.example.quanlycafe.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "TaiKhoan")
@Data
public class TaiKhoan {
    @Id
    @Column(name = "maTaiKhoan")
    private String maTaiKhoan;

    private String tenDangNhap;
    private String matKhau;
    private String loaiTaiKhoan;
    private Integer OTP;

    @OneToOne
    @JoinColumn(name = "maNhanVien") // Đây là cột khóa ngoại trong DB
    @com.fasterxml.jackson.annotation.JsonBackReference // Chặn vòng lặp ở đây
    private NhanVien nhanVien;
}