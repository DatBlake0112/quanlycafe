import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/profile.css";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [workHistory, setWorkHistory] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("2026-04");
    const token = localStorage.getItem('token');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pwdData, setPwdData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [pwdError, setPwdError] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);

    // 👁️ show/hide password
    const [showPwd, setShowPwd] = useState({
        old: false,
        new: false,
        confirm: false
    });

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8081/api/nhan-vien/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    // Fetch work history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (!user?.maNhanVien) return;

                const [year, month] = selectedMonth.split("-");
                const res = await axios.get("http://localhost:8082/api/cham-cong/history", {
                    params: {
                        maNV: user.maNhanVien,
                        month: parseInt(month),
                        year: parseInt(year)
                    },
                    headers: { Authorization: `Bearer ${token}` }
                });

                setWorkHistory(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [selectedMonth, user, token]);

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdError("");

        if (pwdData.newPassword !== pwdData.confirmPassword) {
            return setPwdError("Mật khẩu xác nhận không khớp!");
        }

        setPwdLoading(true);
        try {
            await axios.post(
                "http://localhost:8081/api/auth/change-password",
                {
                    oldPassword: pwdData.oldPassword,
                    newPassword: pwdData.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert("Đổi mật khẩu thành công!");
            setIsModalOpen(false);
            setPwdData({ oldPassword: "", newPassword: "", confirmPassword: "" });

        } catch (err) {
            console.log("Full Error:", err.response); // Xem status và data trả về
            setPwdError(err.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setPwdLoading(false);
        }
    };

    if (!user) return <div className="p-loading">Đang tải...</div>;

    const luongPerHour = user.tienLuong || 0;
    const formatTime = (t) => t ? t.slice(0, 5) : "--";

    return (
        <div className="profile-container">
            {/* PROFILE */}
            <div className="profile-card">
                <div className="profile-left">
                    <div className="avatar">
                        {user.tenNhanVien?.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="profile-right">
                    <p><strong>Họ và tên:</strong> {user.tenNhanVien}</p>
                    <p><strong>Ngày sinh:</strong> {user.ngaySinh || "Chưa cập nhật"}</p>
                    <p><strong>Chức vụ:</strong> {user.chucVu || "Nhân viên"}</p>
                    <p><strong>Ngày vào làm:</strong> {user.ngayVaoLam || "N/A"}</p>
                    <p><strong>Tài khoản:</strong> {user.taiKhoan?.tenDangNhap || "N/A"}</p>

                    <button className="btn-change-password" onClick={() => setIsModalOpen(true)}>
                        Đổi mật khẩu
                    </button>
                </div>
            </div>

            <div className="history">
                <div className="history-header">
                    <h3>Lịch sử làm việc</h3>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>

                {/* WRAPPER MỚI */}
                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Giờ vào</th>
                            <th>Giờ ra</th>
                            <th>Số giờ</th>
                            <th>Tiền</th>
                        </tr>
                        </thead>

                        <tbody>
                        {workHistory.length > 0 ? workHistory.map((item, i) => {
                            const soGio = item.soGio || 0;
                            return (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{new Date(item.ngay).toLocaleDateString("vi-VN")}</td>
                                    <td>{formatTime(item.gioVao)}</td>
                                    <td>{formatTime(item.gioRa)}</td>
                                    <td>{soGio.toFixed(2)}</td>
                                    <td>{(soGio * luongPerHour).toLocaleString("vi-VN")}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="6">Không có dữ liệu</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <div className="salary-hour-box">
                        💰 {luongPerHour.toLocaleString("vi-VN")} VNĐ/H
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Đổi mật khẩu</h2>

                        <form onSubmit={handleChangePassword}>
                            {/* OLD */}
                            <div className="form-group password-group">
                                <label>Mật khẩu cũ</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPwd.old ? "text" : "password"}
                                        value={pwdData.oldPassword}
                                        onChange={(e) => setPwdData({ ...pwdData, oldPassword: e.target.value })}
                                        required
                                    />
                                    <span onClick={() => setShowPwd({ ...showPwd, old: !showPwd.old })}>
                                        {showPwd.old ? "🙈" : "👁️"}
                                    </span>
                                </div>
                            </div>

                            {/* NEW */}
                            <div className="form-group password-group">
                                <label>Mật khẩu mới</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPwd.new ? "text" : "password"}
                                        value={pwdData.newPassword}
                                        onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                        required
                                    />
                                    <span onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })}>
                                        {showPwd.new ? "🙈" : "👁️"}
                                    </span>
                                </div>
                            </div>

                            {/* CONFIRM */}
                            <div className="form-group password-group">
                                <label>Xác nhận</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPwd.confirm ? "text" : "password"}
                                        value={pwdData.confirmPassword}
                                        onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <span onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
                                        {showPwd.confirm ? "🙈" : "👁️"}
                                    </span>
                                </div>
                            </div>

                            {pwdError && <p className="error-msg">{pwdError}</p>}

                            <div className="modal-actions">
                                <button className="btn-save" disabled={pwdLoading}>
                                    {pwdLoading ? "Đang xử lý..." : "Xác nhận"}
                                </button>
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;