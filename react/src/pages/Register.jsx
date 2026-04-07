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
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async () => {
        // Kiểm tra validation: Bắt buộc điền các trường quan trọng
        if (!form.tenNhanVien || !form.email || !form.matKhau || !form.ngaySinh|| !form.xacNhanMK) {
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

            alert("Đăng ký tài khoản Quản lý mới thành công!");
            navigate("/");
        } catch (error) {
            alert(error.response?.data?.error || "Lỗi đăng ký! Vui lòng kiểm tra lại.");
        }
    };

    return (
        <div className="container">
            <div className="left"></div>

            <div className="right">
                <div className="form-box">
                    <div className="header">
                        <div className="title-box">
                            <h1>REGISTER</h1>
                        </div>
                        <div className="logo">
                            <img src="/logo_lado.png" alt="LADO" />
                        </div>
                    </div>

                    <div className="input-group">
                        <input name="tenNhanVien" placeholder="Họ tên quản lý" onChange={handleChange} />

                        <input type="date" name="ngaySinh" onChange={handleChange} />

                        <input name="email" placeholder="Email đăng nhập" onChange={handleChange} />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="matKhau"
                                placeholder="Mật khẩu"
                                onChange={handleChange}
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="xacNhanMK"
                                placeholder="Xác nhận mật khẩu"
                                onChange={handleChange}
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <div className="btn-group">
                        <button className="submit-btn" onClick={handleRegister}>Đăng ký</button>
                        <button className="cancel" onClick={() => navigate("/")}>Hủy</button>
                    </div>

                    <p className="footer-link">
                        Bạn đã có tài khoản?{" "}
                        <span onClick={() => navigate("/")} className="link">Đăng nhập ngay</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;