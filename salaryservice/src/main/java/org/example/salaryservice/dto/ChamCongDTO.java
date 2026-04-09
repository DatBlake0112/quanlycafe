package org.example.salaryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChamCongDTO {
    private String ngay;
    private String gioVao;
    private String gioRa;
    private double soGio;
}