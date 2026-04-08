package org.example.salaryservice.repository;

import org.example.salaryservice.entity.LuongThuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LuongThuongRepository extends JpaRepository<LuongThuong, String> {
    // Tìm tất cả phiếu theo tháng và năm
    List<LuongThuong> findByThangAndNam(Integer thang, Integer nam);

    // Tìm chi tiết phiếu của 1 nhân viên trong tháng
    List<LuongThuong> findByMaNhanVienAndThangAndNam(String maNV, Integer thang, Integer nam);
//    boolean existsByMaChamCong(String maChamCong);
    boolean existsByMaNhanVienAndThangAndNamAndLoaiPhieu(String maNV, Integer thang, Integer nam, String loaiPhieu);
}