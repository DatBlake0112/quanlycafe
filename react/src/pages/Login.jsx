import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // PHẢI IMPORT AXIOS
import "../styles/login.css";

function Login() {
    const [tenDangNhap, setTenDangNhap] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:8081/api/auth/login", {
                tenDangNhap,
                matKhau
            });

            // Kiểm tra dữ liệu trả về trong Console
            console.log("Response từ Backend:", res.data);

            if (res.data.token) {
                // LƯU VÀO LOCAL STORAGE
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("maNhanVien", res.data.maNhanVien);
                localStorage.setItem("tenNhanVien", res.data.tenNhanVien);
                localStorage.setItem("role", res.data.role);

                alert(`Chào mừng ${res.data.tenNhanVien} quay trở lại!`);
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error logging in", error);
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-section">
                <h1 className="title-coffee">COFFEE</h1>

                <div className="logo-circle">
                    <img
                        src="/logo_lado.png"
                        alt="Logo LADO"
                        className="logo-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                <h2 className="title-login">LOGIN</h2>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={tenDangNhap}
                        onChange={(e) => setTenDangNhap(e.target.value)}
                    />
                </div>

                <div className="input-group password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={matKhau}
                        onChange={(e) => setMatKhau(e.target.value)}
                    />
                    <span
                        className="eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>

                <button className="btn-login" onClick={handleLogin}>Đăng nhập</button>

                <p className="footer-text">
                    Bạn không nhớ mật khẩu? <span onClick={() => navigate("/forgot")} className="link">Quên mật khẩu</span>
                </p>
                <p className="footer-text">
                    Chưa có tài khoản? <span onClick={() => navigate("/register")} className="link">Đăng ký ngay</span>
                </p>
            </div>

            <div className="login-image-section">
                <h1 className="title-shop">SHOP</h1>
            </div>
        </div>
    );
}

export default Login;