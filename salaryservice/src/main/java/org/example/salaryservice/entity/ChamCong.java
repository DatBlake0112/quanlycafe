package org.example.salaryservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ChamCong")
@Data
public class ChamCong {
    @Id
    private String maChamCong;
    private String maNhanVien;
    private String maCa;
    private LocalDateTime thoiGianVao;
    private LocalDateTime thoiGianRa;
    private Double soGioLam;
    private String trangThai; // "Đang làm", "Hoàn thành"
}