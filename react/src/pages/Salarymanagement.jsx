import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/salary.css";

function SalaryManagement() {
    const [salaryData, setSalaryData] = useState([]);
    const [thangNam, setThangNam] = useState("04/2026");
    const [loading, setLoading] = useState(false);

    // 1. Lấy dữ liệu bảng lương từ SalaryService (8082)
    const loadSalaryTable = async () => {
        try {
            const res = await axios.get(`http://localhost:8082/api/salary/all?thangNam=${thangNam}`);
            setSalaryData(res.data);
        } catch (error) {
            console.error("Lỗi tải bảng lương:", error);
        }
    };

    useEffect(() => { loadSalaryTable(); }, [thangNam]);

    // 2. Tính lương đồng loạt cho tất cả NV
    const handleTinhLuongDongLoat = async () => {
        setLoading(true);
        try {
            await axios.post(`http://localhost:8082/api/salary/calculate-all`, { thangNam });
            alert("Đã tổng hợp lương thành công!");
            loadSalaryTable(); // Reload lại bảng
        } catch (error) {
            alert("Lỗi tính lương!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="salary-wrapper">
            {/* 4 Thẻ thống kê phía trên */}
            <div className="stats-container">
                <div className="stat-card blue">
                    <span>Tổng Lương Tháng này</span>
                    <h3>125.400.000 đ</h3>
                </div>
                <div className="stat-card orange">
                    <span>Tổng Thưởng</span>
                    <h3>15.200.000 đ</h3>
                </div>
                <div className="stat-card red">
                    <span>Tổng Khấu trừ</span>
                    <h3>3.800.000 đ</h3>
                </div>
                <div className="stat-card gray">
                    <span>NV Chưa tính lương</span>
                    <h3>2</h3>
                </div>
            </div>

            <div className="salary-content">
                <div className="header-actions">
                    <div className="filter-group">
                        <select value={thangNam} onChange={(e) => setThangNam(e.target.value)}>
                            <option value="03/2026">Tháng 03/2026</option>
                            <option value="04/2026">Tháng 04/2026</option>
                        </select>
                        <input type="text" placeholder="Tìm kiếm nhân viên..." className="search-input" />
                    </div>
                    <div className="button-group">
                        <button className="btn-primary" onClick={handleTinhLuongDongLoat} disabled={loading}>
                            {loading ? "ĐANG XỬ LÝ..." : "TÍNH LƯƠNG ĐỒNG LOẠT"}
                        </button>
                        <button className="btn-secondary">XUẤT BÁO CÁO</button>
                    </div>
                </div>

                <table className="styled-table">
                    <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Tên NV</th>
                        <th>Lương cơ bản/giờ</th>
                        <th>Số giờ làm</th>
                        <th>Thưởng</th>
                        <th>Thực nhận</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {salaryData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.maNhanVien}</td>
                            <td><strong>Nguyễn Văn Quản Lý</strong></td> {/* Tên lấy từ User Service */}
                            <td>{item.luongCoBanGio?.toLocaleString()} đ</td>
                            <td>{item.soGioLam} giờ</td>
                            <td className="text-green">+{item.thuong?.toLocaleString()} đ</td>
                            <td className="text-bold">{item.thucNhan?.toLocaleString()} đ</td>
                            <td>
                                    <span className={`status-badge ${item.trangThaiLuong === 'Đã thanh toán' ? 'paid' : 'unpaid'}`}>
                                        {item.trangThaiLuong}
                                    </span>
                            </td>
                            <td>
                                <button className="action-link">Chi tiết</button> |
                                <button className="action-link">Thanh toán</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SalaryManagement;