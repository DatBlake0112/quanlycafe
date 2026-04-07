package org.example.salaryservice.repository;

import org.example.salaryservice.entity.ChamCong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ChamCongRepository extends JpaRepository<ChamCong, String> {

    Optional<ChamCong> findByMaNhanVienAndTrangThai(String maNhanVien, String trangThai);

    // Tìm các ca hoàn thành nhưng chưa có bản ghi bên LuongThuong
    @Query("SELECT c FROM ChamCong c WHERE c.maNhanVien = :maNV " +
            "AND c.trangThai = 'Hoàn thành' " +
            "AND c.maChamCong NOT IN (SELECT lt.maChamCong FROM LuongThuong lt WHERE lt.maChamCong IS NOT NULL)")
    List<ChamCong> findUnpaidByMaNhanVien(@Param("maNV") String maNV);

    @Query("SELECT DISTINCT DAY(c.thoiGianVao) FROM ChamCong c " +
            "WHERE c.maNhanVien = :maNV AND MONTH(c.thoiGianVao) = :m AND YEAR(c.thoiGianVao) = :y")
    List<Integer> findActiveDays(@Param("maNV") String maNV, @Param("m") int m, @Param("y") int y);
}