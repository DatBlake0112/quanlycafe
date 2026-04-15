import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import "../styles/chamcong.css";

const api = axios.create({ baseURL: 'http://localhost:8085/api' });

const ChamCong = () => {
    const [maNV] = useState(localStorage.getItem('maNhanVien'));
    const [tenNV] = useState(localStorage.getItem('tenNhanVien') || 'Nhân viên');
    const [status, setStatus] = useState({ isWorking: false, startTime: null });
    const [timerDisplay, setTimerDisplay] = useState("00:00:00");
    const [activeDays, setActiveDays] = useState([]);
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [totalHoursMonth, setTotalHoursMonth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fixTime, setFixTime] = useState("");
    const [viewDate, setViewDate] = useState({
        month: moment().month() + 1,
        year: moment().year()
    });

    const syncData = useCallback(async () => {
        if (!maNV) return;
        try {
            const [resStatus, resDays] = await Promise.all([
                api.get(`/cham-cong/status/${maNV}`),
                api.get(`/cham-cong/active-days`, {
                    params: { maNV, month: viewDate.month, year: viewDate.year }
                })
            ]);

            if (resStatus.status === 200 && resStatus.data) {
                setStatus({ isWorking: true, startTime: resStatus.data.thoiGianVao });
            } else {
                setStatus({ isWorking: false, startTime: null });
            }

            if (resDays.data) {
                setActiveDays(resDays.data);
                const total = resDays.data.reduce((sum, item) => sum + (Number(item.totalHours || item.TOTALHOURS) || 0), 0);
                setTotalHoursMonth(total);
            }
        } catch (error) {
            console.error("Lỗi đồng bộ:", error);
        }
    }, [maNV, viewDate]);

    useEffect(() => { syncData(); }, [syncData]);

    useEffect(() => {
        let timer = null;
        if (status.isWorking && status.startTime) {
            timer = setInterval(() => {
                const now = moment();
                const start = moment(status.startTime);
                const diff = moment.duration(now.diff(start));
                const h = Math.floor(diff.asHours()).toString().padStart(2, '0');
                const m = diff.minutes().toString().padStart(2, '0');
                const s = diff.seconds().toString().padStart(2, '0');
                setTimerDisplay(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setTimerDisplay("00:00:00");
        }
        return () => clearInterval(timer);
    }, [status.isWorking, status.startTime]);

    const handleAction = async () => {
        const msg = status.isWorking ? "Bạn muốn kết thúc ca làm?" : "Bạn muốn bắt đầu vào ca?";
        if (!window.confirm(msg)) return;
        setLoading(true);
        try {
            await api.post(`/cham-cong/thuc-hien`, { maNV });
            await syncData();
            setSelectedDayInfo(null);
        } catch (error) {
            alert(error.response?.data || "Lỗi hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    const handleFixError = async () => {
        if (!fixTime) return alert("Vui lòng chọn giờ ra!");
        setLoading(true);
        try {
            await api.put(`/cham-cong/fix-ca-loi`, {
                maNV,
                day: Number(selectedDayInfo.day || selectedDayInfo.DAY),
                month: Number(viewDate.month),
                year: Number(viewDate.year),
                gioRaMoi: fixTime
            });
            alert("Đã cập nhật giờ làm thành công!");
            setFixTime("");
            setSelectedDayInfo(null);
            await syncData();
        } catch (error) {
            alert(error.response?.data || "Lỗi cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = moment(`${viewDate.year}-${viewDate.month}`, "YYYY-M").daysInMonth();
    const firstDay = moment(`${viewDate.year}-${viewDate.month}-01`, "YYYY-M-D").isoWeekday();

    const calendarGrid = [];
    for (let i = 1; i < firstDay; i++) { calendarGrid.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { calendarGrid.push(i); }

    return (
        <div className="cc-container">
            <div className="cc-card cc-left">
                <div className="cc-header">
                    <div>
                        <h2 className="cc-title">Lịch trình làm việc</h2>
                        <div className="cc-badge">Tháng {viewDate.month}: {totalHoursMonth.toFixed(1)}h</div>
                    </div>
                    <div className="cc-filters">
                        <select
                            value={viewDate.month}
                            onChange={e => setViewDate({...viewDate, month: parseInt(e.target.value)})}
                        >
                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                        </select>
                    </div>
                </div>

                <div className="cc-calendar">
                    {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} className="cc-dow">{d}</div>)}

                    {calendarGrid.map((day, i) => {
                        if (day === null) return <div key={`empty-${i}`} className="cc-day empty"></div>;

                        const dayData = activeDays.find(d => Number(d.day || d.DAY) === Number(day));
                        const isSelected = (Number(selectedDayInfo?.day || selectedDayInfo?.DAY) === Number(day));

                        // Logic mới: Tách biệt hoàn toàn 2 trạng thái
                        const total = Number(dayData?.totalHours ?? dayData?.TOTALHOURS ?? 0);
                        const errorCount = Number(dayData?.errorCount ?? dayData?.ERRORCOUNT ?? 0);

                        const isError = dayData && errorCount > 0;
                        const isActive = dayData && total > 0;


                        return (
                            <div key={day}
                                 className={`cc-day 
                                    ${isError ? 'is-error' : ''} 
                                    ${isActive ? 'is-active' : ''} 
                                    ${isSelected ? 'is-selected' : ''}`}
                                 onClick={() => {
                                     setSelectedDayInfo(dayData ? dayData : { day, totalHours: 0, noRecord: true });
                                     setFixTime("");
                                 }}>
                                {day}
                                {dayData && <i className="cc-dot"></i>}
                            </div>
                        );
                    })}
                </div>

                <div className="cc-detail">
                    {selectedDayInfo ? (
                        <div className="cc-detail-box">
                            <div className="detail-row">
                                <span>Ngày {selectedDayInfo.day || selectedDayInfo.DAY}/{viewDate.month}:</span>
                                <strong> {Number(selectedDayInfo.totalHours || selectedDayInfo.TOTALHOURS || 0).toFixed(1)} giờ làm</strong>
                            </div>

                            <div className={`status-badge ${Number(selectedDayInfo.totalHours || selectedDayInfo.TOTALHOURS) > 0 ? 'success' : (selectedDayInfo.noRecord ? 'none' : 'error')}`}>
                                {Number(selectedDayInfo.totalHours || selectedDayInfo.TOTALHOURS) > 0
                                    ? "● HOÀN THÀNH"
                                    : (selectedDayInfo.noRecord ? "○ CHƯA CHẤM CÔNG" : "● LỖI (QUÊN TAN LÀM)")
                                }
                            </div>
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
                        {status.isWorking ? "● ĐANG TRONG CA" : "○ ĐANG NGHỈ"}
                    </div>
                </div>
                <button
                    disabled={loading}
                    className={`cc-btn ${status.isWorking ? 'btn-stop' : 'btn-start'}`}
                    onClick={handleAction}
                >
                    {loading ? "ĐANG XỬ LÝ..." : (status.isWorking ? "TAN LÀM" : "VÀO CA")}
                </button>

                {selectedDayInfo && !selectedDayInfo.noRecord && Number(selectedDayInfo.totalHours || selectedDayInfo.TOTALHOURS || 0) === 0 && (
                    <div className="cc-fix-section">
                        <hr />
                        <h4>Sửa ca lỗi ngày {selectedDayInfo.day || selectedDayInfo.DAY}</h4>
                        <div className="fix-input-group">
                            <input type="time" value={fixTime} onChange={e => setFixTime(e.target.value)} />
                            <button disabled={loading} onClick={handleFixError}>Lưu</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChamCong;