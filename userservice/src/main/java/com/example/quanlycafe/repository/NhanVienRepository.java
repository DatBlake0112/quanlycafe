package com.example.quanlycafe.repository;

import com.example.quanlycafe.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {


    @Query("SELECT MAX(n.maNhanVien) FROM NhanVien n WHERE n.maNhanVien LIKE :prefix")
    Optional<String> findMaxMaNhanVienByPrefix(@Param("prefix") String prefix);

    @Query("SELECT nv FROM NhanVien nv JOIN nv.taiKhoan tk WHERE tk.tenDangNhap = :username")
    Optional<NhanVien> findByUsernameFromAccount(@Param("username") String username);

}