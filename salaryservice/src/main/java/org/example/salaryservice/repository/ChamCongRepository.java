package org.example.salaryservice.repository;

import org.example.salaryservice.dto.ChamCongSummary;
import org.example.salaryservice.entity.ChamCong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ChamCongRepository extends JpaRepository<ChamCong, String> {

    Optional<ChamCong> findByMaNhanVienAndTrangThai(String maNhanVien, String trangThai);

    // Tìm các ca hoàn thành nhưng chưa có bản ghi bên LuongThuong
    @Query("SELECT c FROM ChamCong c WHERE c.maNhanVien = :maNV " +
            "AND c.trangThai = 'Hoàn thành' ")
    List<ChamCong> findUnpaidByMaNhanVien(@Param("maNV") String maNV);

    @Query("SELECT DISTINCT DAY(c.thoiGianVao) FROM ChamCong c " +
            "WHERE c.maNhanVien = :maNV AND MONTH(c.thoiGianVao) = :m AND YEAR(c.thoiGianVao) = :y")
    List<Integer> findActiveDays(@Param("maNV") String maNV, @Param("m") int m, @Param("y") int y);

    @Query("SELECT SUM(c.soGioLam) FROM ChamCong c " +
            "WHERE c.maNhanVien = :maNV " +
            "AND FUNCTION('MONTH', c.thoiGianVao) = :thang " +
            "AND FUNCTION('YEAR', c.thoiGianVao) = :nam")
    Double sumSoGioLamByMonth(@Param("maNV") String maNV,
                              @Param("thang") int thang,
                              @Param("nam") int nam);
    // Bạn có thể dùng Query để lấy theo tháng/năm từ thoiGianVao
    @Query("SELECT c FROM ChamCong c WHERE c.maNhanVien = ?1 AND MONTH(c.thoiGianVao) = ?2 AND YEAR(c.thoiGianVao) = ?3")
    List<ChamCong> findByMaNhanVienAndThangAndNam(String maNV, Integer thang, Integer nam);
    @Query(value = "SELECT DAY(thoiGianVao) as day, " +
            "SUM(DATEDIFF(SECOND, thoiGianVao, thoiGianRa)) / 3600.0 as totalHours " +
            "FROM ChamCong  " +
            "WHERE maNhanVien = :maNV " +
            "AND MONTH(thoiGianVao) = :month " +
            "AND YEAR(thoiGianVao) = :year " +
            "AND trangThai = 'Hoàn thành' " +
            "GROUP BY DAY(thoiGianVao)", nativeQuery = true)
    List<Map<String, Object>> findActiveDaysWithHours(
            @Param("maNV") String maNV,
            @Param("month") int month,
            @Param("year") int year);
}