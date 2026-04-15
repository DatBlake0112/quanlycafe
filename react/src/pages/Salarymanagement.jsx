import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import "../styles/salary.css";

function SalaryManagement() {
    const [salaryData, setSalaryData] = useState([]);
    const [filter, setFilter] = useState({ thang: 4, nam: 2026 });
    const [loading, setLoading] = useState(false);
    const [employeeNames, setEmployeeNames] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Form điều chỉnh nhanh
    const [newAdj, setNewAdj] = useState({ loaiPhieu: 'THUONG', soTien: '', ghiChu: '' });

    const loadEmployeeNames = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8086/api/nhan-vien", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const nameMap = {};
            res.data.forEach(emp => { nameMap[emp.maNhanVien] = emp.tenNhanVien; });
            setEmployeeNames(nameMap);
        } catch (error) { console.error("Lỗi lấy danh sách nhân viên:", error); }
    };

    const loadData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:8085/api/salary/all`, {
                params: { thang: filter.thang, nam: filter.nam },
                headers: { Authorization: `Bearer ${token}` }
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
                trangThai: item.trangThaiLuong
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
                const token = localStorage.getItem("token");
                await axios.put(`http://localhost:8085/api/salary/pay/${maNV}`, null, {
                    params: { thang: filter.thang, nam: filter.nam },
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Thanh toán thành công!");
                loadData();
            } catch { alert("Lỗi khi thanh toán!"); }
        }
    };

    const handleTinhLuongDongLoat = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = { thang: parseInt(filter.thang), nam: parseInt(filter.nam) };
            await axios.post(`http://localhost:8085/api/salary/calculate-all`, data,{
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã tổng hợp lương thành công!");
            loadData();
        } catch (error) {
            alert(error.response?.data || "Lỗi tính lương!");
        } finally { setLoading(false); }
    };

    const handleAddAdjustment = async () => {
        if (!newAdj.soTien || !newAdj.ghiChu) return alert("Nhập đủ tiền và lý do!");
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8085/api/salary/create", {
                maNhanVien: selectedItem.maNhanVien,
                loaiPhieu: newAdj.loaiPhieu,
                soTien: parseFloat(newAdj.soTien),
                thang: filter.thang,
                nam: filter.nam,
                ghiChu: newAdj.ghiChu
            },{
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã thêm điều chỉnh!");
            setNewAdj({ loaiPhieu: 'THUONG', soTien: '', ghiChu: '' });
            await loadData(); // Kích hoạt cập nhật lại salaryData để Modal nhận số mới
        } catch { alert("Lỗi khi thêm điều chỉnh!"); }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        // Xóa sạch dữ liệu input trong form điều chỉnh
        setNewAdj({ loaiPhieu: 'THUONG', soTien: '', ghiChu: '' });
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Lương Tháng ${filter.thang}`);

        worksheet.columns = [
            { header: 'Mã NV', key: 'maNV', width: 12 },
            { header: 'Họ và Tên', key: 'hoTen', width: 25 },
            { header: 'Số giờ làm', key: 'gioLam', width: 12 },
            { header: 'Lương dự kiến (đ)', key: 'luong', width: 20 },
            { header: 'Thưởng (đ)', key: 'thuong', width: 15 },
            { header: 'Khấu trừ (đ)', key: 'phat', width: 15 },
            { header: 'Thực nhận (đ)', key: 'thucNhan', width: 22 },
            { header: 'Trạng thái', key: 'status', width: 15 },
        ];

        displayData.forEach(emp => {
            const thucNhanVal = emp.luongDuKien + emp.thuong - emp.phat;
            const row = worksheet.addRow({
                maNV: emp.maNhanVien,
                hoTen: emp.hoTen,
                gioLam: emp.soGioLam.toFixed(1),
                luong: emp.luongDuKien,
                thuong: emp.thuong,
                phat: emp.phat,
                thucNhan: thucNhanVal,
                status: emp.trangThai
            });
            row.getCell('thucNhan').font = { bold: true, color: { argb: 'FF0000FF' } };
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Bang_Luong_Thang_${filter.thang}_${filter.nam}.xlsx`);
    };

    return (
        <div className="salary-wrapper">
            <div className="stats-container">
                <div className="stat-card blue"><span>Tổng Lương Dự Kiến</span><h3>{stats.tongLuong.toLocaleString()} đ</h3></div>
                <div className="stat-card orange"><span>Tổng Thưởng 🟨</span><h3>{stats.tongThuong.toLocaleString()} đ</h3></div>
                <div className="stat-card red"><span>Tổng Khấu trừ 🟥</span><h3>{stats.tongKhauTru.toLocaleString()} đ</h3></div>
                <div className="stat-card gray"><span>NV Chưa thanh toán</span><h3>{stats.nvCount}</h3></div>
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
                        <button className="btn-export" onClick={handleExportExcel} style={{backgroundColor: '#27ae60', color: 'white', marginRight: '10px'}}>
                            XUẤT EXCEL 📊
                        </button>
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
                        {displayData.map((emp, index) => (
                            <tr key={index}>
                                <td>{emp.maNhanVien}</td>
                                <td><strong>{emp.hoTen}</strong></td>
                                <td>{emp.soGioLam.toFixed(1)} giờ</td>
                                <td className="text-bold">{emp.luongDuKien.toLocaleString()} đ</td>
                                <td className="text-bold text-primary">{(emp.luongDuKien + emp.thuong - emp.phat).toLocaleString()} đ</td>
                                <td><span className={`status-badge ${emp.trangThai === 'Đã thanh toán' ? 'paid' : 'unpaid'}`}>{emp.trangThai}</span></td>
                                <td>
                                    <div className="action-buttons-group">
                                        <button className="btn-action detail" onClick={() => {setSelectedItem(emp); setShowModal(true)}}>CHI TIẾT</button>
                                        <button className="btn-action pay" onClick={() => handleThanhToan(emp.maNhanVien)} disabled={emp.trangThai === 'Đã thanh toán'}>THANH TOÁN</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT THEO CÁCH 2 - TÍNH TOÁN TRỰC TIẾP TỪ SALARYDATA */}
            {showModal && selectedItem && (() => {
                // Lấy tất cả bản ghi mới nhất của nhân viên này từ salaryData
                const currentRecords = salaryData.filter(item => item.maNhanVien === selectedItem.maNhanVien && item.thang === filter.thang);

                // Tách riêng bản ghi lương để lấy giờ làm và tiền gốc
                const luongRow = currentRecords.find(r => r.loaiPhieu === 'LUONG') || { soGioLam: 0, soTien: 0 };
                const adjList = currentRecords.filter(i => i.loaiPhieu !== 'LUONG');

                const luongCoBanGio = (luongRow.soGioLam > 0) ? (luongRow.soTien / luongRow.soGioLam) : 0;
                const tongThuongVal = adjList.filter(i => i.loaiPhieu === 'THUONG').reduce((s, i) => s + i.soTien, 0);
                const tongPhatVal = adjList.filter(i => i.loaiPhieu === 'PHAT').reduce((s, i) => s + i.soTien, 0);

                const tongDieuChinh = tongThuongVal - tongPhatVal;
                const thucNhanVal = luongRow.soTien + tongDieuChinh;

                return (
                    <div className="modal-overlay">
                        <div className="modal-content large-modal">
                            <div className="modal-header">
                                <h2>CHI TIẾT PHIẾU LƯƠNG: {selectedItem.hoTen} ({selectedItem.maNhanVien}) - Tháng {filter.thang < 10 ? `0${filter.thang}` : filter.thang}/{filter.nam}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <fieldset className="salary-fieldset">
                                    <legend>[TÓM TẮT CÔNG VIỆC]</legend>
                                    <div className="summary-row">Tổng thời gian làm việc: <strong>{luongRow.soGioLam.toFixed(1)} giờ</strong></div>
                                    <div className="summary-row">Mức lương cơ bản/giờ: <strong>{luongCoBanGio.toLocaleString()} đ</strong></div>
                                    <div className="summary-row text-bold">=&gt; Thành tiền (Lương giờ): {luongRow.soTien.toLocaleString()} đ</div>
                                </fieldset>

                                <fieldset className="salary-fieldset">
                                    <legend>[DANH SÁCH THƯỞNG / KHẤU TRỪ]</legend>
                                    <table className="adjustment-table">
                                        <thead><tr><th>Loại</th><th>Số tiền</th><th>Ngày tạo</th><th>Ghi chú</th></tr></thead>
                                        <tbody>
                                        {adjList.length > 0 ? adjList.map((adj, idx) => (
                                            <tr key={idx}>
                                                <td className={adj.loaiPhieu === 'THUONG' ? 'text-success' : 'text-danger'}>{adj.loaiPhieu === 'THUONG' ? 'THƯỞNG (+)' : 'PHẠT (-)'}</td>
                                                <td className="text-bold">{adj.loaiPhieu === 'THUONG' ? '+' : '-'} {adj.soTien.toLocaleString()} đ</td>
                                                <td className="text-muted">{new Date(adj.ngayTao).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-muted">{adj.ghiChu || "..."}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" style={{textAlign: 'center', color: '#999'}}>Chưa có thưởng/phạt</td></tr>
                                        )}
                                        </tbody>
                                    </table>
                                    <div className={`total-adjustment ${tongDieuChinh >= 0 ? 'text-success' : 'text-danger'}`}>
                                        TỔNG ĐIỀU CHỈNH: {tongDieuChinh >= 0 ? '+' : ''}{tongDieuChinh.toLocaleString()} đ
                                    </div>
                                </fieldset>

                                <div className="final-payment">THỰC NHẬN CUỐI CÙNG: <h3>{thucNhanVal.toLocaleString()} đ</h3></div>

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
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={handleCloseModal}>ĐÓNG</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default SalaryManagement;