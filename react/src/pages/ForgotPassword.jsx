import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/forgot.css";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        try {
            const res = await fetch("http://localhost:8086/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (res.ok) setStep(2);
            else alert("Email không tồn tại!");
        } catch { alert("Lỗi kết nối server!"); }
    };

    const handleVerifyOTP = async () => {
        try {
            const res = await fetch("http://localhost:8086/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: parseInt(otp) })
            });
            if (res.ok) setStep(3);
            else alert("Mã OTP không chính xác!");
        } catch { alert("Lỗi kết nối server!"); }
    };

    const handleResetPassword = async () => {
        if (password !== confirm) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        try {
            const res = await fetch("http://localhost:8086/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: parseInt(otp), newPassword: password })
            });
            if (res.ok) {
                alert("Đổi mật khẩu thành công!");
                navigate("/");
            } else alert("Lỗi reset mật khẩu!");
        } catch { alert("Lỗi hệ thống!"); }
    };

    return (
        <div className="portal-container">
            {/* BÊN TRÁI - Đồng bộ Hero Section */}
            <div className="portal-hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <span className="brand-label">LADO COFFEE SYSTEM</span>
                        <div className="hero-title-wrapper">
                            <h1 className="hero-title">Khôi phục</h1>
                            <h1 className="hero-title highlight">mật khẩu hệ thống</h1>
                        </div>
                        <p className="hero-description">
                            Đừng lo lắng, hãy làm theo các bước xác thực để bảo vệ <br/>
                            tài khoản quản trị của bạn một cách an toàn nhất.
                        </p>
                    </div>
                    <div className="hero-footer">
                        <span>© 2024 Lado Coffee Portal</span>
                        <span>Hỗ trợ: 1900 xxxx</span>
                    </div>
                </div>
            </div>

            {/* BÊN PHẢI - Form xác thực 3 bước */}
            <div className="portal-form-section">
                <div className="top-right-logo">
                    <img src="/lg_lado.png" alt="Lado Logo" />
                </div>

                <div className="form-wrapper">
                    <div className="welcome-text-group">
                        <h2 className="form-welcome">Quên mật khẩu?</h2>
                        <p className="form-subtitle">
                            {step === 1 && "Bước 1: Nhập email đăng ký của bạn"}
                            {step === 2 && "Bước 2: Nhập mã OTP đã được gửi"}
                            {step === 3 && "Bước 3: Thiết lập lại mật khẩu mới"}
                        </p>
                    </div>

                    <div className="forgot-content-box">
                        {step === 1 && (
                            <div className="input-field">
                                <label>Email khôi phục</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        placeholder="Nhập Gmail đăng ký của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button className="btn-portal-submit" onClick={handleSendOTP}>GỬI MÃ OTP</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="input-field">
                                <label>Mã xác thực OTP</label>
                                <div className="input-icon-wrapper">
                                    <span className="input-icon">🔑</span>
                                    <input
                                        type="text"
                                        placeholder="6 chữ số"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <button className="btn-portal-submit" onClick={handleVerifyOTP}>XÁC NHẬN MÃ</button>
                            </div>
                        )}

                        {step === 3 && (
                            <>
                                <div className="input-field">
                                    <label>Mật khẩu mới</label>
                                    <div className="input-icon-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập mật khẩu mới"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? "👁️" : "🙈"}
                                        </span>
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Xác nhận lại mật khẩu</label>
                                    <div className="input-icon-wrapper">
                                        <span className="input-icon">✔️</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu"
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button className="btn-portal-submit" onClick={handleResetPassword}>LƯU MẬT KHẨU</button>
                            </>
                        )}
                    </div>

                    <div className="form-footer-actions">
                        <button className="btn-outline-full" onClick={() => navigate("/")}>
                            QUAY LẠI ĐĂNG NHẬP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}