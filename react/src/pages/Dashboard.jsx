import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const tenQuanLy = localStorage.getItem('tenNhanVien') || 'Quản lý';

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // 1. Xóa toàn bộ dữ liệu người dùng cũ trong máy
            localStorage.clear();
            sessionStorage.clear();

            // 2. Quay về trang login
            navigate("/");
        }
    };

    const menuItems = [
        {
            id: 1,
            title: "Quản Lý Nhân Sự",
            icon: "👥",
            description: "Thêm, sửa, xóa và quản lý danh sách nhân viên.",
            path:"/employee-management",
            color: "#4e73df"
        },
        {
            id: 2,
            title: "Chấm Công",
            icon: "⏱️",
            description: "Mở ca làm việc, tính giờ và xem lịch sử công.",
            path: "/cham-cong",
            color: "#1cc88a"
        },
        {
            id: 3,
            title: "Quản lý lương thưởng",
            icon: "💰", // Sửa icon cho đúng
            description: "Quản lý lương thưởng.",
            path: "/tinh-luong", // Bỏ bớt dấu / bị thừa
            color: "#a6a553"
        }
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Hệ Thống Quản Lý</h1>
                    <p>Xin chào, <strong>{tenQuanLy}</strong>!</p>
                </div>

                {/* NÚT LOGOUT MỚI THÊM VÀO ĐÂY */}
                <button className="logout-button" onClick={handleLogout}>
                    Đăng xuất 🚪
                </button>
            </header>

            <div className="dashboard-grid">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className="menu-card"
                        onClick={() => navigate(item.path)}
                        style={{ borderTop: `5px solid ${item.color}` }}
                    >
                        <div className="card-icon" style={{ color: item.color }}>{item.icon}</div>
                        <div className="card-content">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                        <div className="card-footer">
                            <span>Truy cập ngay →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;