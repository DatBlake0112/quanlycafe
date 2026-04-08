import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import "../styles/chamcong.css";

const api = axios.create({ baseURL: 'http://localhost:8082/api' });

const ChamCong = () => {
    const [maNV] = useState(localStorage.getItem('maNhanVien'));
    const [tenNV] = useState(localStorage.getItem('tenNhanVien') || 'Nhân viên');
    const [status, setStatus] = useState({ isWorking: false, startTime: null });
    const [timerDisplay, setTimerDisplay] = useState("00:00:00");
    const [activeDays, setActiveDays] = useState([]);
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [totalHoursMonth, setTotalHoursMonth] = useState(0);
    const [viewDate, setViewDate] = useState({ month: moment().month() + 1, year: moment().year() });

    const syncData = useCallback(async () => {
        if (!maNV) return;
        try {
            const [resStatus, resDays] = await Promise.all([
                api.get(`/cham-cong/status/${maNV}`),
                api.get(`/cham-cong/active-days`, { params: { maNV, month: viewDate.month, year: viewDate.year } })
            ]);
            if (resStatus.data) {
                setStatus({ isWorking: resStatus.data.trangThai === "Đang làm", startTime: resStatus.data.thoiGianVao });
            }
            if (resDays.data) {
                setActiveDays(resDays.data);
                const total = resDays.data.reduce((sum, item) => sum + (item.totalHours || 0), 0);
                setTotalHoursMonth(total);
            }
        } catch (error) { console.error("Lỗi đồng bộ:", error); }
    }, [maNV, viewDate]);

    useEffect(() => { syncData(); }, [syncData]);

    useEffect(() => {
        let timer = null;
        if (status.isWorking && status.startTime) {
            timer = setInterval(() => {
                const diff = moment.duration(moment().diff(moment(status.startTime)));
                setTimerDisplay(`${Math.floor(diff.asHours()).toString().padStart(2, '0')}:${diff.minutes().toString().padStart(2, '0')}:${diff.seconds().toString().padStart(2, '0')}`);
            }, 1000);
        } else { setTimerDisplay("00:00:00"); }
        return () => clearInterval(timer);
    }, [status.isWorking, status.startTime]);

    const handleAction = async () => {
        if (!window.confirm(status.isWorking ? "Kết thúc ca làm?" : "Bắt đầu vào ca?")) return;
        try {
            await api.post(`/cham-cong/thuc-hien`, { maNV });
            await syncData();
        } catch (error) { alert("Lỗi: " + (error.response?.data || "Lỗi kết nối")); }
    };

    return (
        <div className="cc-container">
            <div className="cc-card cc-left">
                <div className="cc-header">
                    <div>
                        <h2 className="cc-title">Lịch trình làm việc</h2>
                        <div className="cc-badge">Tổng: {totalHoursMonth.toFixed(1)}h</div>
                    </div>
                    <div className="cc-filters">
                        <select value={viewDate.month} onChange={e => setViewDate({...viewDate, month: e.target.value})}>
                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                        </select>
                    </div>
                </div>

                <div className="cc-calendar">
                    {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} className="cc-dow">{d}</div>)}
                    {[...Array(moment(`${viewDate.year}-${viewDate.month}`, "YYYY-M").daysInMonth())].map((_, i) => {
                        const day = i + 1;
                        const dayData = activeDays.find(d => (typeof d === 'object' ? d.day : d) === day);
                        const isSelected = selectedDayInfo?.day === day;
                        return (
                            <div key={day} className={`cc-day ${dayData ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                                 onClick={() => setSelectedDayInfo(typeof dayData === 'object' ? dayData : { day, totalHours: dayData ? "Đã có công" : 0 })}>
                                {day}
                                {dayData && <i className="cc-dot"></i>}
                            </div>
                        );
                    })}
                </div>

                <div className="cc-detail">
                    {selectedDayInfo ? (
                        <div className="cc-detail-box">
                            <span>Ngày {selectedDayInfo.day}/{viewDate.month}:</span>
                            <strong>{typeof selectedDayInfo.totalHours === 'number' ? `${selectedDayInfo.totalHours.toFixed(1)} giờ` : selectedDayInfo.totalHours}</strong>
                        </div>
                    ) : <p className="cc-hint">Chọn ngày để xem chi tiết</p>}
                </div>
            </div>

            <div className="cc-card cc-right">
                <div className="cc-user">
                    <div className="cc-avatar">👤</div>
                    <div><h4>{tenNV}</h4><p>{maNV}</p></div>
                </div>
                <div className="cc-timer">
                    <div className="cc-clock">{timerDisplay}</div>
                    <div className={`cc-status ${status.isWorking ? 'working' : ''}`}>
                        {status.isWorking ? "● ĐANG LÀM" : "○ ĐANG NGHỈ"}
                    </div>
                </div>
                <button className={`cc-btn ${status.isWorking ? 'btn-stop' : 'btn-start'}`} onClick={handleAction}>
                    {status.isWorking ? "TAN LÀM" : "VÀO CA"}
                </button>
            </div>
        </div>
    );
};

export default ChamCong;