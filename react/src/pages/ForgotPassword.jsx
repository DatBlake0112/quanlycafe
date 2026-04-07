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
    const [showConfirm, setShowConfirm] = useState(false);

    // STEP 1: gửi email nhận OTP
    const handleSendOTP = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setStep(2);
            } else {
                alert("Email không tồn tại!");
            }
        } catch {
            alert("Lỗi kết nối server!");
        }
    };

    // STEP 2: xác nhận OTP
    const handleVerifyOTP = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: parseInt(otp) })
            });

            if (res.ok) {
                setStep(3);
            } else {
                alert("Mã OTP không chính xác!");
            }
        } catch {
            alert("Lỗi kết nối server!");
        }
    };

    // STEP 3: đổi mật khẩu mới
    const handleResetPassword = async () => {
        if (password !== confirm) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp: parseInt(otp),
                    newPassword: password
                })
            });

            if (res.ok) {
                alert("Đổi mật khẩu thành công!");
                navigate("/");
            } else {
                alert("Lỗi reset mật khẩu!");
            }
        } catch {
            alert("Lỗi hệ thống!");
        }
    };

    return (
        <div className="forgot-container">
            <div className="left-img"></div>

            <div className="right-form">
                <div className="header-box">
                    <h1 className="title-forgot">FORGOT</h1>
                    <h1 className="title-forgot">PASSWORD</h1>
                </div>

                <div className="logo-circle">
                    <img src="/logo_lado.png" alt="Logo" />
                </div>

                {/* STEP 1: NHẬP EMAIL */}
                {step === 1 && (
                    <>
                        <input
                            className="input-forgot"
                            placeholder="Nhập Gmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="btn-action" onClick={handleSendOTP}>Nhận OTP</button>
                    </>
                )}

                {/* STEP 2: NHẬP OTP */}
                {step === 2 && (
                    <>
                        <input
                            className="input-forgot"
                            placeholder="Nhập mã OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button className="btn-action" onClick={handleVerifyOTP}>Xác nhận</button>
                    </>
                )}

                {/* STEP 3: RESET MẬT KHẨU */}
                {step === 3 && (
                    <>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-forgot"
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>

                        <div className="password-wrapper">
                            <input
                                type={showConfirm ? "text" : "password"}
                                className="input-forgot"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                            />
                            <span className="eye-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>

                        <button className="btn-action" onClick={handleResetPassword}>Lưu mật khẩu</button>
                    </>
                )}

                <p className="footer-text">
                    Bạn đã có tài khoản?{" "}
                    <span onClick={() => navigate("/")} className="link">Đăng nhập ngay</span>
                </p>
            </div>
        </div>
    );
}