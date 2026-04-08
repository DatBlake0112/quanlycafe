import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/salary.css";

function SalaryManagement() {
    const [salaryData, setSalaryData] = useState([]);
    const [filter, setFilter] = useState({ thang: 4, nam: 2026 });
    const [loading, setLoading] = useState(false);
    const [employeeNames, setEmployeeNames] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // THÊM STATE CHO FORM ĐIỀU CHỈNH NHANH
    const [newAdj, setNewAdj] = useState({ loaiPhieu: 'THUONG', soTien: '', ghiChu: '' });

    const loadEmployeeNames = async () => {
        try {
            const res = await axios.get("http://localhost:8081/api/nhan-vien");
            const nameMap = {};
            res.data.forEach(emp => { nameMap[emp.maNhanVien] = emp.tenNhanVien; });
            setEmployeeNames(nameMap);
        } catch (error) { console.error("Lỗi lấy danh sách nhân viên:", error); }
    };

    const loadData = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:8082/api/salary/all`, {
                params: { thang: filter.thang, nam: filter.nam }
            });
            setSalaryData(res.data);
        } catch (error) { console.error("Lỗi tải dữ liệu lương:", error); }
    }, [filter]);

    useEffect(() => {
        loadEmployeeNames();
        loadData();
    }, [loadData]);

    const stats = {
        tongLuong: salaryData.reduce((s, i) => s + (i.loaiPhieu === 'LUONG' ? i.soTien : 0), 0),
        tongThuong: salaryData.reduce((s, i) => s + (i.loaiPhieu === 'THUONG' ? i.soTien : 0), 0),
        tongKhauTru: salaryData.reduce((s, i) => s + (i.loaiPhieu === 'PHAT' ? i.soTien : 0), 0),
        nvCount: new Set(
            salaryData
                .filter(i => i.trangThaiLuong === 'Chưa thanh toán')
                .map(i => i.maNhanVien)
        ).size
    };

    const filteredData = salaryData.filter(item => {
        const name = employeeNames[item.maNhanVien] || "";
        const id = item.maNhanVien || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const groupedEmployees = filteredData.reduce((acc, item) => {
        const maNV = item.maNhanVien;
        if (!acc[maNV]) {
            acc[maNV] = {
                maNhanVien: maNV,
                hoTen: employeeNames[maNV] || "Đang tải...",
                soGioLam: 0,
                luongDuKien: 0,
                thuong: 0,
                phat: 0,
                trangThai: item.trangThaiLuong,
                maPhieu: item.maPhieu
            };
        }

        if (item.loaiPhieu === 'LUONG') {
            acc[maNV].soGioLam += item.soGioLam || 0;
            acc[maNV].luongDuKien += item.soTien || 0;
        } else if (item.loaiPhieu === 'THUONG') {
            acc[maNV].thuong += item.soTien || 0;
        } else if (item.loaiPhieu === 'PHAT') {
            acc[maNV].phat += item.soTien || 0;
        }
        return acc;
    }, {});

    const displayData = Object.values(groupedEmployees);

    const handleThanhToan = async (maNV) => {
        if (window.confirm(`Xác nhận thanh toán cho nhân viên này?`)) {
            try {
                // Sửa API thanh toán theo nhân viên và kỳ lương
                await axios.put(`http://localhost:8082/api/salary/pay/${maNV}`, null, {
                    params: { thang: filter.thang, nam: filter.nam }
                });
                alert("Thanh toán thành công!");
                loadData();
            } catch { alert("Lỗi khi thanh toán!"); }
        }
    };

    const handleTinhLuongDongLoat = async () => {
        setLoading(true);
        try {
            const data = { thang: parseInt(filter.thang), nam: parseInt(filter.nam) };
            await axios.post(`http://localhost:8082/api/salary/calculate-all`, data);
            alert("Đã tổng hợp lương thành công!");
            loadData();
        } catch (error) { alert("Lỗi tính lương!"); }
        finally { setLoading(false); }
    };

    // HÀM XỬ LÝ THÊM ĐIỀU CHỈNH NHANH
    const handleAddAdjustment = async () => {
        if (!newAdj.soTien || !newAdj.ghiChu) return alert("Nhập đủ tiền và lý do!");
        try {
            await axios.post("http://localhost:8082/api/salary/create", {
                maNhanVien: selectedItem.maNhanVien,
                loaiPhieu: newAdj.loaiPhieu,
                soTien: parseFloat(newAdj.soTien),
                thang: filter.thang,
                nam: filter.nam,
                ghiChu: newAdj.ghiChu
            });
            alert("Đã thêm điều chỉnh!");
            setNewAdj({ loaiPhieu: 'THUONG', soTien: '', ghiChu: '' });
            loadData();
        } catch { alert("Lỗi khi thêm!"); }
    };

    return (
        <div className="salary-wrapper">
            <div className="stats-container">
                <div className="stat-card blue"><span>Tổng Lương Dự Kiến</span><h3>{stats.tongLuong.toLocaleString()} đ</h3></div>
                <div className="stat-card orange"><span>Tổng Thưởng 🟨</span><h3>{stats.tongThuong.toLocaleString()} đ</h3></div>
                <div className="stat-card red"><span>Tổng Khấu trừ 🟥</span><h3>{stats.tongKhauTru.toLocaleString()} đ</h3></div>
                <div className="stat-card gray"><span>NV Chưa tính lương</span><h3>{stats.nvCount}</h3></div>
            </div>

            <div className="salary-content">
                <div className="header-actions">
                    <div className="filter-group">
                        <select onChange={(e) => setFilter({...filter, thang: parseInt(e.target.value)})}>
                            <option value="4">Tháng 04/2026</option>
                            <option value="3">Tháng 03/2026</option>
                        </select>
                        <input type="text" placeholder="Tìm kiếm..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="button-group">
                        <button className="btn-primary" onClick={handleTinhLuongDongLoat} disabled={loading}>{loading ? "ĐANG XỬ LÝ..." : "TÍNH LƯƠNG ĐỒNG LOẠT"}</button>
                    </div>
                </div>

                <div className="table-scroll">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Mã NV</th><th>Họ Tên</th><th>Số giờ làm</th><th>Lương dự kiến</th><th>Thực nhận</th><th>Trạng thái</th><th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayData.map((emp, index) => {
                            const giaTriThucNhan = emp.luongDuKien + emp.thuong - emp.phat;
                            return (
                                <tr key={index}>
                                    <td>{emp.maNhanVien}</td>
                                    <td><strong>{emp.hoTen}</strong></td>
                                    <td>{emp.soGioLam.toFixed(1)} giờ</td>
                                    <td className="text-bold">{emp.luongDuKien.toLocaleString()} đ</td>
                                    <td className="text-bold text-primary">{giaTriThucNhan.toLocaleString()} đ</td>
                                    <td><span className={`status-badge ${emp.trangThai === 'Đã thanh toán' ? 'paid' : 'unpaid'}`}>{emp.trangThai}</span></td>
                                    <td>
                                        <div className="action-buttons-group">
                                            <button className="btn-action detail" onClick={() => {setSelectedItem(emp); setShowModal(true)}} disabled={emp.trangThai === 'Đã thanh toán'}>CHI TIẾT</button>
                                            <button className="btn-action pay" onClick={() => handleThanhToan(emp.maNhanVien)} disabled={emp.trangThai === 'Đã thanh toán'}>THANH TOÁN</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT HOÀN CHỈNH THEO MẪU */}
            {showModal && selectedItem && (() => {
                const detailList = salaryData.filter(item => item.maNhanVien === selectedItem.maNhanVien && item.thang === filter.thang);
                const luongCoBanGio = (selectedItem.soGioLam > 0) ? (selectedItem.luongDuKien / selectedItem.soGioLam) : 0;
                const thucNhanVal = selectedItem.luongDuKien + selectedItem.thuong - selectedItem.phat;
                const tongDieuChinh = selectedItem.thuong - selectedItem.phat;

                return (
                    <div className="modal-overlay">
                        <div className="modal-content large-modal">
                            <div className="modal-header">
                                <h2>CHI TIẾT PHIẾU LƯƠNG: {selectedItem.hoTen} ({selectedItem.maNhanVien}) - Tháng {filter.thang < 10 ? `0${filter.thang}` : filter.thang}/{filter.nam}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <fieldset className="salary-fieldset">
                                    <legend>[TÓM TẮT CÔNG VIỆC]</legend>
                                    <div className="summary-row">Tổng thời gian làm việc: <strong>{selectedItem.soGioLam.toFixed(1)} giờ</strong></div>
                                    <div className="summary-row">Mức lương cơ bản/giờ: <strong>{luongCoBanGio.toLocaleString()} đ</strong></div>
                                    <div className="summary-row text-bold">=&gt; Thành tiền (Lương giờ): {selectedItem.luongDuKien.toLocaleString()} đ</div>
                                </fieldset>

                                <fieldset className="salary-fieldset">
                                    <legend>[DANH SÁCH THƯỞNG / KHẤU TRỪ]</legend>
                                    <table className="adjustment-table">
                                        <thead><tr><th>Loại</th><th>Số tiền</th><th>Ghi chú</th></tr></thead>
                                        <tbody>
                                        {detailList.filter(i => i.loaiPhieu !== 'LUONG').map((adj, idx) => (
                                            <tr key={idx}>
                                                <td className={adj.loaiPhieu === 'THUONG' ? 'text-success' : 'text-danger'}>{adj.loaiPhieu === 'THUONG' ? 'THƯỞNG (+)' : 'PHẠT (-)'}</td>
                                                <td className="text-bold">{adj.loaiPhieu === 'THUONG' ? '+' : '-'} {adj.soTien.toLocaleString()} đ</td>
                                                <td className="text-muted">{adj.ghiChu || "..."}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <div className={`total-adjustment ${tongDieuChinh >= 0 ? 'text-success' : 'text-danger'}`}>
                                        TỔNG ĐIỀU CHỈNH: {tongDieuChinh >= 0 ? '+' : ''}{tongDieuChinh.toLocaleString()} đ
                                    </div>
                                </fieldset>

                                <div className="final-payment">THỰC NHẬN CUỐI CÙNG: <h3>{thucNhanVal.toLocaleString()} đ</h3></div>

                                {/* KHUNG THÊM ĐIỀU CHỈNH NHANH */}
                                <fieldset className="salary-fieldset">
                                    <legend>[THÊM ĐIỀU CHỈNH NHANH]</legend>
                                    <div className="add-adj-form">
                                        <div className="form-row">
                                            <label>Loại khoản: </label>
                                            <select value={newAdj.loaiPhieu} onChange={e => setNewAdj({...newAdj, loaiPhieu: e.target.value})}>
                                                <option value="THUONG">Thưởng</option><option value="PHAT">Phạt </option>
                                            </select>
                                            <label style={{marginLeft: '15px'}}>Số tiền: </label>
                                            <input type="number" value={newAdj.soTien} onChange={e => setNewAdj({...newAdj, soTien: e.target.value})} placeholder="0" />
                                        </div>
                                        <div className="form-row" style={{marginTop: '10px'}}>
                                            <label>Ghi chú: </label>
                                            <textarea style={{flex: 1, padding: '8px'}} value={newAdj.ghiChu} onChange={e => setNewAdj({...newAdj, ghiChu: e.target.value})} placeholder="Lý do thưởng/phạt tại đây..." />
                                        </div>
                                        <button className="btn-update-salary" onClick={handleAddAdjustment}>CẬP NHẬT VÀO PHIẾU LƯƠNG</button>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>ĐÓNG</button></div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default SalaryManagement;