import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/employee.css";

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        maNhanVien: "",
        tenNhanVien: "",
        ngaySinh: "",
        chucVu: "Nhân Viên Bán",
        tienLuong: "",
        tenDangNhap: ""
    });

    const [selectedRowId, setSelectedRowId] = useState(null);
    const token = localStorage.getItem("token");

    // 1. Sửa API lấy toàn bộ nhân viên (Bỏ maThuongHieu)
    const loadEmployees = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(
                `http://localhost:8086/api/nhan-vien`, // Gọi cổng 8086
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(res.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { loadEmployees(); }, [loadEmployees]);

    const handleRowClick = (emp) => {
        setFormData({
            maNhanVien: emp.maNhanVien,
            tenNhanVien: emp.tenNhanVien,
            ngaySinh: emp.ngaySinh || "",
            chucVu: emp.chucVu || "Nhân Viên Bán",
            tienLuong: emp.tienLuong || "",
            tenDangNhap: emp.taiKhoan ? emp.taiKhoan.tenDangNhap : ""
        });
        setSelectedRowId(emp.maNhanVien);
    };

    const handleReset = () => {
        setFormData({ maNhanVien: "", tenNhanVien: "", ngaySinh: "", chucVu: "Nhân Viên Bán", tienLuong: "", tenDangNhap: "" });
        setSelectedRowId(null);
    };

    // 2. Sửa API Cập nhật
    const handleUpdate = async () => {
        if (!formData.maNhanVien) return alert("Vui lòng chọn nhân viên từ bảng!");
        try {
            await axios.put(`http://localhost:8086/api/nhan-vien/${formData.maNhanVien}`, formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Cập nhật thành công!");
            loadEmployees();
            handleReset();
        } catch { alert("Lỗi cập nhật!"); }
    };

    // 3. Sửa API Thêm mới (Bỏ object thuongHieu)
    const handleAdd = async () => {
        if (!formData.tenNhanVien || !formData.tenDangNhap) {
            return alert("Vui lòng nhập đầy đủ Tên nhân viên và Email!");
        }

        try {
            // Không gửi kèm thuongHieu nữa
            await axios.post(
                `http://localhost:8086/api/nhan-vien`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Thêm nhân viên thành công!");
            loadEmployees();
            handleReset();
        } catch (error) {
            console.error("Lỗi khi thêm:", error);
            alert("Lỗi: " + (error.response?.data || "Không thể thêm nhân viên."));
        }
    };
    const handleDelete = async () => {
        if (!selectedRowId) return alert("Vui lòng chọn nhân viên cần xóa!");

        const confirmDelete = window.confirm(`Xác nhận xóa nhân viên [${formData.tenNhanVien}]?`);
        if (confirmDelete) {
            try {
                // Gửi request delete kèm token để backend thực hiện check history bên Salary Service
                await axios.delete(`http://localhost:8086/api/nhan-vien/${selectedRowId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                alert("Thao tác thành công! Nhân viên đã được xóa vĩnh viễn hoặc chuyển trạng thái nghỉ việc.");
                loadEmployees();
                handleReset();
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Lỗi: Không thể thực hiện thao tác xóa.");
            }
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="admin-container">
            <h2 className="main-title">QUẢN LÝ NHÂN SỰ</h2>

            <div className="info-section">
                <legend>Thông tin nhân viên</legend>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Mã Nhân Viên:</label>
                        <input type="text" value={formData.maNhanVien} disabled className="readonly-input"  />
                    </div>
                    <div className="input-group">
                        <label>Tên Nhân Viên:</label>
                        <input type="text" value={formData.tenNhanVien}
                               onChange={(e) => setFormData({...formData, tenNhanVien: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Ngày Sinh:</label>
                        <input type="date" value={formData.ngaySinh}
                               onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Chức Vụ:</label>
                        <select value={formData.chucVu} onChange={(e) => setFormData({...formData, chucVu: e.target.value})}>
                            <option value="Quản lý">Quản lý</option>
                            <option value="Nhân Viên Bán">Nhân Viên Bán</option>
                            <option value="Nhân Viên Pha Chế">Nhân Viên Pha Chế</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Lương mỗi giờ:</label>
                        <input type="number" value={formData.tienLuong}
                               onChange={(e) => setFormData({...formData, tienLuong: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Email:</label>
                        <input type="email" value={formData.tenDangNhap}
                               onChange={(e) => setFormData({...formData, tenDangNhap: e.target.value})}
                               disabled={selectedRowId !== null}
                               className={selectedRowId !== null ? "readonly-input" : ""}
                               placeholder="example@gmail.com"
                        />
                    </div>
                </div>

                <div className="button-group">
                    <button className="btn-add" onClick={handleAdd}>Thêm</button>
                    <button className="btn-edit" onClick={handleUpdate}>Sửa</button>
                    <button className="btn-delete" onClick={handleDelete} >Xóa</button>
                    <button className="btn-reset" onClick={handleReset}>Làm mới</button>
                </div>
            </div>

            <div className="list-section">
                <legend>Danh sách nhân viên</legend>
                {/* Bọc bảng vào div responsive và giới hạn chiều cao nếu cần */}
                <div className="table-responsive">
                    <table className="employee-table">
                        <thead>
                        <tr>
                            <th>Mã NV</th>
                            <th>Tên NV</th>
                            <th>Ngày Sinh</th>
                            <th>Chức Vụ</th>
                            <th>Lương/h</th>
                            <th>Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map(emp => (
                            <tr
                                key={emp.maNhanVien}
                                onClick={() => handleRowClick(emp)}
                                className={`selectable-row ${selectedRowId === emp.maNhanVien ? 'active-row' : ''}`}
                            >
                                <td>{emp.maNhanVien}</td>
                                <td>{emp.tenNhanVien}</td>
                                <td>{emp.ngaySinh}</td>
                                <td>{emp.chucVu}</td>
                                <td className="salary-col">{emp.tienLuong?.toLocaleString()}</td>
                                <td>{emp.taiKhoan ? emp.taiKhoan.tenDangNhap : "Chưa có TK"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagement;