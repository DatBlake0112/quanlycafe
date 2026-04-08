package org.example.salaryservice.repository;

import org.example.salaryservice.entity.LuongThuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LuongThuongRepository extends JpaRepository<LuongThuong, String> {

    List<LuongThuong> findByThangNam(String thangNam);

    @Query("SELECT SUM(l.soTien) FROM LuongThuong l WHERE l.thangNam = :tn AND l.loaiKhoan = 'LUONG'")
    Double sumTotalSalary(@Param("tn") String thangNam);

    @Query("SELECT SUM(l.soTien) FROM LuongThuong l WHERE l.thangNam = :tn AND l.loaiKhoan = 'THUONG'")
    Double sumTotalBonus(@Param("tn") String thangNam);

    @Query("SELECT SUM(l.soTien) FROM LuongThuong l WHERE l.thangNam = :tn AND l.loaiKhoan = 'PHAT'")

    Double sumTotalDeduct(@Param("tn") String thangNam);
    @Query("SELECT COUNT(DISTINCT c.maNhanVien) FROM ChamCong c " +
            "WHERE MONTH(c.thoiGianVao) = :month AND YEAR(c.thoiGianVao) = :year " +
            "AND c.trangThai = 'Hoàn thành' " +
            "AND c.maChamCong NOT IN (SELECT lt.maChamCong FROM LuongThuong lt WHERE lt.maChamCong IS NOT NULL)")
    Long countEmployeesNotYetCalculated(@Param("month") int month, @Param("year") int year);
}