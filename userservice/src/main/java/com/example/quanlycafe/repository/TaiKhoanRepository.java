package com.example.quanlycafe.repository;

import com.example.quanlycafe.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {

    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    boolean existsByTenDangNhap(String tenDangNhap);

    // Thêm hàm này để IdGeneratorService có thể lấy mã tài khoản lớn nhất (ví dụ: TK0005)
    @Query("SELECT MAX(t.maTaiKhoan) FROM TaiKhoan t")
    Optional<String> findMaxMaTK();
}