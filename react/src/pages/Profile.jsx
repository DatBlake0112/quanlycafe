import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/profile.css";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [workHistory, setWorkHistory] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("2026-04");
    const token = localStorage.getItem('token');

    // 👉 Lấy thông tin cá nhân từ userservice (8081)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8081/api/nhan-vien/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data); // Trích xuất các trường: tenNhanVien, ngaySinh, chucVu, ngayVaoLam
            } catch (err) {
                console.error("Lỗi lấy thông tin cá nhân:", err);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (!user) return;
                const [year, month] = selectedMonth.split("-");
                const res = await axios.get("http://localhost:8082/api/cham-cong/history", {
                    params: { maNV: user.maNhanVien, month: month, year: year },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkHistory(res.data || []);
            } catch (err) {
                console.error("Lỗi lấy lịch sử công:", err);
            }
        };
        fetchHistory();
    }, [selectedMonth, token, user]);

    if (!user) return <div className="p-loading">Đang tải...</div>;

    // Lấy lương theo giờ từ trường tienLuong trong NhanVien.java
    const luongPerHour = user.tienLuong || 0;

    return (
        <div className="profile-container">
            {/* KHỐI THÔNG TIN CÁ NHÂN */}
            <div className="profile-card">
                <div className="profile-left">
                    <div className="avatar">{user.tenNhanVien?.charAt(0).toUpperCase()}</div>
                </div>

                <div className="profile-right">
                    <p><strong>Họ và tên:</strong> <span className="name">{user.tenNhanVien}</span></p>
                    <p><strong>Ngày sinh:</strong> {user.ngaySinh || "Chưa cập nhật"}</p> {/* */}
                    <p><strong>Chức vụ:</strong> {user.chucVu || "Nhân viên"}</p> {/* */}
                    <p><strong>Ngày vào làm:</strong> {user.ngayVaoLam || "N/A"}</p> {/* */}
                    <p><strong>Tên đăng nhập:</strong> {user.taiKhoan?.tenDangNhap || "N/A"}</p> {/* */}

                    <button className="btn-change-password">Đổi mật khẩu</button>
                </div>
            </div>

            {/* KHỐI LỊCH SỬ LÀM VIỆC */}
            <div className="history">
                <div className="history-header">
                    <h3>Lịch sử làm việc:</h3>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>

                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngày</th>
                            <th>Giờ vào</th>
                            <th>Giờ ra</th>
                            <th>Số giờ</th>
                            <th>Thành tiền (VNĐ)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {workHistory.length > 0 ? workHistory.map((item, index) => {
                            // Xử lý LocalDateTime từ ChamCong Entity
                            const vao = new Date(item.thoiGianVao);
                            const ra = item.thoiGianRa ? new Date(item.thoiGianRa) : null;
                            const soGio = item.soGioLam || 0; //

                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{vao.toLocaleDateString("vi-VN")}</td>
                                    <td>{vao.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td>{ra ? ra.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "--"}</td>
                                    <td>{soGio.toFixed(1)}</td>
                                    <td>{(soGio * luongPerHour).toLocaleString("vi-VN")}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="6">Không có dữ liệu tháng này</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="salary-hour-box">
                    Lương / giờ: <span>{luongPerHour.toLocaleString("vi-VN")} VNĐ/h</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;