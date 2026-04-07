import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import "../styles/chamcong.css";

// 1. Cấu hình Axios Instance để gửi kèm Token tự động
const api = axios.create({
    baseURL: 'http://localhost:8082/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const ChamCong = () => {
    // Lấy thông tin từ LocalStorage
    const maNV = localStorage.getItem('maNhanVien') || 'QL003';
    const tenNV = localStorage.getItem('tenNhanVien') || 'Nhân viên';

    const [status, setStatus] = useState({ isWorking: false, startTime: null });
    const [timerDisplay, setTimerDisplay] = useState("00:00:00");
    const [activeDays, setActiveDays] = useState([]);

    /**
     * 2. Hàm đồng bộ dữ liệu từ Backend 8082
     */
    const syncData = useCallback(async () => {
        try {
            const [resStatus, resDays] = await Promise.all([
                api.get(`/cham-cong/status/${maNV}`),
                api.get(`/cham-cong/active-days`, {
                    params: {
                        maNV,
                        month: moment().month() + 1,
                        year: moment().year()
                    }
                })
            ]);

            // Cập nhật trạng thái đang làm hay không
            if (resStatus.status === 200 && resStatus.data) {
                setStatus({
                    isWorking: resStatus.data.trangThai === "Đang làm",
                    startTime: resStatus.data.thoiGianVao
                });
            } else {
                setStatus({ isWorking: false, startTime: null });
            }

            // Cập nhật danh sách ngày đi làm để tô màu lịch
            if (resDays.data) {
                setActiveDays(resDays.data);
            }
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu:", error);
            setStatus({ isWorking: false, startTime: null });
        }
    }, [maNV]);

    /**
     * 3. Xử lý khi bấm nút VÀO CA / TAN LÀM
     */
    const handleAction = async () => {
        const msg = status.isWorking ? "Bạn muốn kết thúc ca làm việc?" : "Bạn muốn bắt đầu vào ca?";
        if (!window.confirm(msg)) return;

        try {
            await api.post(`/cham-cong/thuc-hien`, { maNV });
            // Sau khi POST thành công, gọi syncData để cập nhật lại giao diện
            await syncData();
        } catch (error) {
            const errorMsg = error.response?.data || "Lỗi kết nối server";
            alert("Thao tác thất bại: " + errorMsg);
        }
    };

    // Load dữ liệu khi vào trang
    useEffect(() => {
        syncData();
    }, [syncData]);

    /**
     * 4. Logic đồng hồ đếm giờ (Timer)
     */
    useEffect(() => {
        let timer = null;
        if (status.isWorking && status.startTime) {
            timer = setInterval(() => {
                const start = moment(status.startTime);
                const diff = moment.duration(moment().diff(start));

                const h = Math.floor(diff.asHours()).toString().padStart(2, '0');
                const m = diff.minutes().toString().padStart(2, '0');
                const s = diff.seconds().toString().padStart(2, '0');

                setTimerDisplay(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setTimerDisplay("00:00:00");
        }
        return () => { if (timer) clearInterval(timer); };
    }, [status.isWorking, status.startTime]);

    return (
        <div className="attendance-layout">
            {/* PANEL TRÁI: LỊCH LÀM VIỆC */}
            <div className="left-panel">
                <div className="header-box">
                    <h2>Lịch làm việc</h2>
                    <p className="month-label">Tháng {moment().format('M / YYYY')}</p>
                </div>
                <div className="calendar-box">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} className="dow">{d}</div>
                    ))}
                    {[...Array(moment().daysInMonth())].map((_, i) => {
                        const day = i + 1;
                        const isSelected = activeDays.includes(day);
                        return (
                            <div key={day} className={`day ${isSelected ? 'active' : ''}`}>
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PANEL PHẢI: THÔNG TIN & ĐỒNG HỒ */}
            <div className="right-panel">
                <div className="user-card">
                    <div className="avatar">👤</div>
                    <div className="info">
                        <h3>{tenNV}</h3>
                        <p>Mã: {maNV}</p>
                    </div>
                </div>

                <div className="timer-box">
                    <h1 className="digital-clock">{timerDisplay}</h1>
                    <p className="status-label">
                        {status.isWorking ? "ĐANG TRONG CA" : "CHƯA VÀO CA"}
                    </p>
                </div>

                <button
                    className={`action-btn ${status.isWorking ? 'stop' : 'start'}`}
                    onClick={handleAction}
                >
                    {status.isWorking ? "TAN LÀM" : "VÀO CA"}
                </button>
            </div>
        </div>
    );
};

export default ChamCong;