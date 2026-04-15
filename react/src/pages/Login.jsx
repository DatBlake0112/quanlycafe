import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Login() {
    const [tenDangNhap, setTenDangNhap] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:8086/api/auth/login", {
                tenDangNhap, matKhau
            });
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("tenNhanVien", res.data.tenNhanVien);
                localStorage.setItem('maNhanVien', res.data.maNhanVien);
                localStorage.setItem("role", res.data.role);
                navigate("/dashboard");
            }
        } catch {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };
    return (
        <div className="portal-container">
            <div className="portal-hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <span className="brand-label">LADO COFFEE SYSTEM</span>
                        {/* Tách riêng thẻ h1 và dùng thẻ div bao ngoài để tránh lỗi chồng chữ */}
                        <div className="hero-title-wrapper">
                            <h1 className="hero-title">Hệ thống quản lý</h1>
                            <h1 className="hero-title highlight">vận hành cửa hàng</h1>
                        </div>
                        <p className="hero-description">
                            Nền tảng quản trị thông minh giúp theo dõi doanh thu </p><br/>
                        <p> quản lý kho và tối ưu quy trình phục vụ.</p>
                    </div>
                    <div className="hero-footer">
                        <span>© 2024 Lado Coffee Portal</span>
                        <span>Hỗ trợ kỹ thuật</span>
                    </div>
                </div>
            </div>

            <div className="portal-form-section">
                <div className="top-right-logo">
                    <img src="/lg_lado.png" alt="Lado Logo" />
                </div>

                <div className="form-wrapper">
                    <div className="welcome-text-group">
                        <h2 className="form-welcome">Chào mừng trở lại</h2>
                        <p className="form-subtitle">Vui lòng đăng nhập hệ thống Lado Coffee</p>
                    </div>

                    <div className="input-field">
                        <label>Tên đăng nhập / Email</label>
                        <div className="input-icon-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                placeholder="Nhập tài khoản"
                                value={tenDangNhap}
                                onChange={(e) => setTenDangNhap(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-field">
                        <label>Mật khẩu</label>
                        <div className="input-icon-wrapper">
                            <span className="input-icon">🔒</span>
                            <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
                            <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️" : "🙈"}</span>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me"><input type="checkbox" /> Ghi nhớ</label>
                        <span className="link" onClick={() => navigate("/register")}>Đăng ký?</span>
                        <span className="link" onClick={() => navigate("/forgot")}>Quên mật khẩu?</span>
                    </div>

                    <button className="btn-portal-submit" onClick={handleLogin}>ĐĂNG NHẬP HỆ THỐNG</button>

                    <div className="form-footer-actions">
                        <button className="btn-outline">📖 Hướng dẫn</button>
                        <button className="btn-outline">🎧 Liên hệ Admin</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;