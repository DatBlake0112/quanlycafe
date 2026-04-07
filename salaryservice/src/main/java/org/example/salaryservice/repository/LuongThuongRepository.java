package org.example.salaryservice.repository;

import org.example.salaryservice.entity.LuongThuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LuongThuongRepository extends JpaRepository<LuongThuong, String> {

    // Lấy toàn bộ phiếu thưởng/phạt của NV trong tháng (thangNam định dạng "MM/yyyy")
    List<LuongThuong> findByMaNhanVienAndThangNam(String maNV, String thangNam);

    // Tính tổng tiền thưởng trong tháng
    @Query("SELECT SUM(l.soTien) FROM LuongThuong l " +
            "WHERE l.maNhanVien = :maNV " +
            "AND l.thangNam = :thangNam " +
            "AND l.loaiKhoan = 'THUONG'")
    Double sumBonusByMonth(@Param("maNV") String maNV, @Param("thangNam") String thangNam);

    // Tính tổng tiền phạt trong tháng
    @Query("SELECT SUM(l.soTien) FROM LuongThuong l " +
            "WHERE l.maNhanVien = :maNV " +
            "AND l.thangNam = :thangNam " +
            "AND l.loaiKhoan = 'PHAT'")
    Double sumPenaltyByMonth(@Param("maNV") String maNV, @Param("thangNam") String thangNam);
}