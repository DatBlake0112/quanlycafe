import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/salary.css";

function SalaryManagement() {
    const [salaryData, setSalaryData] = useState([]);
    const [thangNam, setThangNam] = useState("04/2026");
    const [loading, setLoading] = useState(false);
    const [employeeNames, setEmployeeNames] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ tongLuong: 0, tongThuong: 0, tongKhauTru: 0, nvChuaTinh: 0 });

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadEmployeeNames = async () => {
        try {
            const res = await axios.get("http://localhost:8081/api/nhan-vien");
            const nameMap = {};
            res.data.forEach(emp => { nameMap[emp.maNhanVien] = emp.tenNhanVien; });
            setEmployeeNames(nameMap);
        } catch (error) { console.error("Lỗi lấy danh sách nhân viên:", error); }
    };

    const loadData = async () => {
        try {
            const [resTable, resStats] = await Promise.all([
                axios.get(`http://localhost:8082/api/salary/all?thangNam=${thangNam}`),
                axios.get(`http://localhost:8082/api/salary/stats?thangNam=${thangNam}`)
            ]);
            setSalaryData(resTable.data);
            setStats(resStats.data);
        } catch (error) { console.error("Lỗi tải dữ liệu lương:", error); }
    };

    useEffect(() => {
        loadEmployeeNames();
        loadData();
    }, [thangNam]);

    // 2. Logic lọc dữ liệu: Tìm theo Mã NV hoặc Tên NV (không phân biệt hoa thường)
    const filteredData = salaryData.filter(item => {
        const name = employeeNames[item.maNhanVien] || "";
        const id = item.maNhanVien || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Xử lý Thanh toán với xác nhận
    const handleThanhToan = async (maPhieu) => {
        if (window.confirm(`Bạn có chắc chắn muốn thanh toán phiếu lương ${maPhieu}?`)) {
            try {
                await axios.put(`http://localhost:8082/api/salary/pay/${maPhieu}`);
                alert("Thanh toán thành công!");
                loadData();
            } catch {
                alert("Lỗi khi thanh toán!");
            }
        }
    };

    // Mở Modal chi tiết
    const openModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleTinhLuongDongLoat = async () => {
        setLoading(true);
        try {
            await axios.post(`http://localhost:8082/api/salary/calculate-all`, { thangNam });
            alert("Đã tổng hợp lương thành công!");
            loadData();
        } catch { alert("Lỗi tính lương!"); } finally { setLoading(false); }
    };

    return (
        <div className="salary-wrapper">
            {/* Stats Container giữ nguyên */}
            <div className="stats-container">
                <div className="stat-card blue"><span>Tổng Lương Tháng này</span><h3>{(stats.tongLuong || 0).toLocaleString()} đ</h3></div>
                <div className="stat-card orange"><span>Tổng Thưởng</span><h3>{(stats.tongThuong || 0).toLocaleString()} đ</h3></div>
                <div className="stat-card red"><span>Tổng Khấu trừ</span><h3>{(stats.tongKhauTru || 0).toLocaleString()} đ</h3></div>
                <div className="stat-card gray"><span>NV Chưa tính lương</span><h3>{stats.nvChuaTinh || 0}</h3></div>
            </div>

            <div className="salary-content">
                <div className="header-actions">
                    <div className="filter-group">
                        <select value={thangNam} onChange={(e) => setThangNam(e.target.value)}>
                            <option value="03/2026">Tháng 03/2026</option>
                            <option value="04/2026">Tháng 04/2026</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã hoặc tên..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Nhóm nút bên phải */}
                    <div className="button-group">
                        <button className="btn-primary" onClick={handleTinhLuongDongLoat} disabled={loading}>
                            {loading ? "ĐANG XỬ LÝ..." : "TÍNH LƯƠNG ĐỒNG LOẠT"}
                        </button>
                        <button className="btn-secondary">XUẤT BÁO CÁO</button>
                    </div>
                </div>

                <div className="table-scroll">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Mã NV</th>
                            <th>Tên NV</th>
                            <th>Loại khoản</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th style={{ width: "200px" }}>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.maNhanVien}</td>
                                <td><strong>{employeeNames[item.maNhanVien] || "Đang tải..."}</strong></td>
                                <td>{item.loaiKhoan}</td>
                                <td className="text-bold">{(item.soTien || 0).toLocaleString()} đ</td>
                                <td>
                                <span className={`status-badge ${item.trangThaiLuong === 'Đã thanh toán' ? 'paid' : 'unpaid'}`}>
                                    {item.trangThaiLuong}
                                </span>
                                </td>
                                {/* Cột Hành động gộp 1 hàng */}
                                <td>
                                    <div className="action-buttons-group">
                                        <button className="btn-action detail" onClick={() => openModal(item)}>Chi tiết</button>
                                        <button
                                            className="btn-action pay"
                                            onClick={() => handleThanhToan(item.maPhieu)}
                                            disabled={item.trangThaiLuong === 'Đã thanh toán'}
                                        >
                                            Thanh toán
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {showModal && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chi tiết phiếu lương</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Mã phiếu:</strong> {selectedItem.maPhieu}</p>
                            <p><strong>Nhân viên:</strong> {employeeNames[selectedItem.maNhanVien]}</p>
                            <p><strong>Loại khoản:</strong> {selectedItem.loaiKhoan}</p>
                            <p><strong>Số tiền:</strong> {selectedItem.soTien?.toLocaleString()} đ</p>
                            <p><strong>Tháng/Năm:</strong> {selectedItem.thangNam}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(selectedItem.ngayTao).toLocaleString('vi-VN')}</p>
                            <p><strong>Mã chấm công:</strong> {selectedItem.maChamCong || "N/A"}</p>
                            <p><strong>Ghi chú:</strong> {selectedItem.ghiChu || "Không có"}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalaryManagement;