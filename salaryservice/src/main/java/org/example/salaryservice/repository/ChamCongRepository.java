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
    @Query(value = "SELECT " +
            "DAY(thoiGianVao) AS day, " +
            "CAST(SUM(soGioLam) AS DECIMAL(10,2)) AS totalHours, " +
            "COUNT(maChamCong) AS countRecords, " +
            "SUM(CASE WHEN trangThai = N'Lỗi ca' THEN 1 ELSE 0 END) AS errorCount " +
            "FROM ChamCong " +
            "WHERE maNhanVien = :maNV " +
            "AND MONTH(thoiGianVao) = :month " +
            "AND YEAR(thoiGianVao) = :year " +
            "GROUP BY DAY(thoiGianVao)",
            nativeQuery = true)
    List<Map<String, Object>> findActiveDaysWithHours(
            @Param("maNV") String maNV,
            @Param("month") int month,
            @Param("year") int year);
    @Query("SELECT cc FROM ChamCong cc WHERE cc.maNhanVien = :maNV " +
            "AND MONTH(cc.thoiGianVao) = :month AND YEAR(cc.thoiGianVao) = :year " +
            "ORDER BY cc.thoiGianVao ASC")
    List<ChamCong> findByMonth(@Param("maNV") String maNV, @Param("month") int month, @Param("year") int year
    );
    @Query("SELECT c FROM ChamCong c WHERE c.maNhanVien = :maNV " +
            "AND DAY(c.thoiGianVao) = :day " +
            "AND MONTH(c.thoiGianVao) = :month " +
            "AND YEAR(c.thoiGianVao) = :year " +
            "AND c.trangThai LIKE %:status%")
    Optional<ChamCong> findErrorShift(@Param("maNV") String maNV,
                                      @Param("day") int day,
                                      @Param("month") int month,
                                      @Param("year") int year,
                                      @Param("status") String status);
    boolean existsByMaNhanVien(String maNhanVien);
}