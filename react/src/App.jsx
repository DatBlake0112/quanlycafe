import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import EmployeeManagement from "./pages/EmployeeManagement";
import ChamCong from "./pages/ChamCong";
import Dashboard from "./pages/Dashboard";
import LuongThuong from "./pages/Salarymanagement";
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Routes>
                {/* Luồng Đăng nhập & Tài khoản */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot" element={<ForgotPassword />} />

                {/* Trang điều hướng chính sau khi Login */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Các chức năng quản lý chi tiết */}
                <Route path="/employee-management" element={<EmployeeManagement />} />
                <Route path="/cham-cong" element={<ChamCong />} />
                <Route path="/tinh-luong" element={<LuongThuong />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;