import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tracking.css';

const statusOptions = [
  'Đã tiếp nhận',
  'Đang vận chuyển',
  'Đã giao hàng',
  'Giao thất bại'
];

const Tracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTracking();
  }, []);

  const fetchTracking = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/tracking');
      setTrackings(res.data);
      setError(res.data.length === 0 ? 'Không có dữ liệu tracking' : '');
    } catch (err) {
      console.error('Lỗi khi fetch tracking:', err);
      setError('Lỗi khi lấy dữ liệu tracking');
    }
  };

  const handleChangeClick = (id, currentStatus) => {
    setEditingStatusId(id);
    setNewStatus(currentStatus);
  };

  const handleSaveStatus = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/tracking/${id}`, { Status: newStatus });
      setEditingStatusId(null);
      setNewStatus('');
      fetchTracking();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  return (
    <section className="tk-section">
      <div className="tk-card">
        <div className="tk-card-header">
          <h3>Kiểm tra trạng thái đơn hàng</h3>
        </div>

        <table className="tk-table">
          <thead>
            <tr>
              <th>ID Đơn</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Vị trí</th>
              <th>Nhân viên</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {trackings.length > 0 ? (
              trackings.map((t, index) => (
                <tr key={index}>
                  <td>{t.Order_id}</td>
                  <td>{new Date(t.Timestamp).toLocaleString('vi-VN')}</td>
                  <td>
                    {editingStatusId === t.TrackingID ? (
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      t.Status
                    )}
                  </td>
                  <td>{t.Location}</td>
                  <td>{t.StaffName || '—'}</td>
                  <td>{t.Notes || '—'}</td>
                  <td>
                    {editingStatusId === t.TrackingID ? (
                      <button className="tk-btn tk-btn-primary" onClick={() => handleSaveStatus(t.TrackingID)}>Lưu</button>
                    ) : (
                      <button className="tk-btn tk-btn-secondary" onClick={() => handleChangeClick(t.TrackingID, t.Status)}>Thay đổi trạng thái</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>
                  {error || 'Không có dữ liệu tracking'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Tracking;
