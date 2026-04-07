package com.example.quanlycafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String tenNhanVien;

    private String tenDangNhap;
    private String matKhau;
    private LocalDate ngaySinh;
}