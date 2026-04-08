import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import { register } from "../services/authService";

function Register() {
    const [form, setForm] = useState({
        tenNhanVien: "",
        ngaySinh: "",
        email: "",
        matKhau: "",
        xacNhanMK: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        if (!form.tenNhanVien || !form.email || !form.matKhau || !form.ngaySinh || !form.xacNhanMK) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        if (form.matKhau !== form.xacNhanMK) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            await register({
                tenNhanVien: form.tenNhanVien,
                ngaySinh: form.ngaySinh,
                tenDangNhap: form.email,
                matKhau: form.matKhau,
                xacNhanMK: form.matKhau
            });
            alert("Đăng ký thành công!");
            navigate("/");
        } catch (error) {
            alert(error.response?.data?.error || "Lỗi đăng ký!");
        }
    };

    return (
        <div className="portal-container">
            {/* BÊN TRÁI - Đồng bộ với Login */}
            <div className="portal-hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <span className="brand-label">LADO COFFEE SYSTEM</span>
                        <div className="hero-title-wrapper">
                            <h1 className="hero-title">Gia nhập đội ngũ</h1>
                            <h1 className="hero-title highlight">quản trị hệ thống</h1>
                        </div>
                        <p className="hero-description">
                            Tạo tài khoản để bắt đầu điều hành </p><br/>
                        <p> quản lý nhân sự và kết toán doanh thu.</p>
                    </div>
                    <div className="hero-footer">
                        <span>© 2024 Lado Coffee Portal</span>
                        <span>Hỗ trợ đăng ký: 1900 xxxx</span>
                    </div>
                </div>
            </div>

            {/* BÊN PHẢI - Form Register */}
            <div className="portal-form-section">

                <div className="form-wrapper">
                    <div className="welcome-text-group">
                        <h2 className="form-welcome">Đăng ký tài khoản</h2>
                        <p className="form-subtitle">Hệ thống quản lý nội bộ Lado Coffee</p>
                    </div>

                    <div className="input-group-scroll"> {/* Cho phép cuộn nếu form dài */}
                        <div className="input-field">
                            <label>Họ tên Quản lý</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon">👤</span>
                                <input name="tenNhanVien" placeholder="Nhập họ và tên" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Ngày sinh</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon">📅</span>
                                <input type="date" name="ngaySinh" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Email đăng nhập</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon">✉️</span>
                                <input name="email" placeholder="example@gmail.com" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Mật khẩu</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="matKhau"
                                    placeholder="Tối thiểu 6 ký tự"
                                    onChange={handleChange}
                                />
                                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "👁️" : "🙈"}
                                </span>
                            </div>
                        </div>

                        <div className="input-field">
                            <label>Xác nhận mật khẩu</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon">✔️</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="xacNhanMK"
                                    placeholder="Nhập lại mật khẩu"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-options">
                        Bạn đã có tài khoản?{" "}
                        <span className="link" onClick={() => navigate("/")}>Đăng nhập ngay</span>
                    </div>

                    <div className="btn-group-portal">
                        <button className="btn-portal-submit" onClick={handleRegister}>TẠO TÀI KHOẢN</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;