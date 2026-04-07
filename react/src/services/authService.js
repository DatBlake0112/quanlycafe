import axios from "axios";

/**
 * Đường dẫn cơ sở khớp với @RequestMapping("/api/auth") trong Spring Boot.
 * Nếu bạn dùng Vite/React, hãy đảm bảo đã cấu hình Proxy trong vite.config.js
 * để chuyển hướng /api sang http://localhost:8080.
 */
const API = "/api/auth";

// 1. ĐĂNG NHẬP
export const login = (data) => {
    // data bao gồm { tenDangNhap, matKhau }
    return axios.post(`${API}/login`, data);
};

// 2. ĐĂNG KÝ
export const register = (data) => {
    // data bao gồm các trường của Entity TaiKhoan
    console.log("Data gửi đi:", data);
    return axios.post(`${API}/register`, data);
};

// 3. QUÊN MẬT KHẨU (Gửi OTP qua Email)
export const forgotPassword = (email) => {
    // Gửi object { email: "..." } vì Backend dùng Map để lấy
    return axios.post(`${API}/forgot`, { email });
};

// 4. XÁC THỰC MÃ OTP
export const verifyOTP = (email, otp) => {
    // Phải khớp với Map<String, String> và Integer.parseInt(req.get("otp")) ở Backend
    return axios.post(`${API}/verify-otp`, {
        email: email,
        otp: otp.toString()
    });
};

// 5. ĐẶT LẠI MẬT KHẨU MỚI
export const resetPassword = (email, otp, password) => {
    return axios.post(`${API}/reset`, {
        email: email,
        otp: otp.toString(),
        password: password
    });
};

/**
 * Gợi ý thêm: Hàm lưu và xóa Token sau khi login thành công
 */
export const saveToken = (token) => {
    localStorage.setItem("token", token);
};

export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};