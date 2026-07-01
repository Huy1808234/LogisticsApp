import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Package.css';

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    PackageID: '',
    Order_id: '',
    Sender_id: '',
    Receiver_id: '',
    Service_id: '',
    Weight: '',
    Dimensions: '',
    Description: '',
    Value: '',
    Current_Warehouse_id: '',
    Status: '',
    Estimated_delivery: '',
    Is_fragile: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchAllData = () => {
    axios.get('http://localhost:3000/api/packages').then(res => setPackages(res.data));
    axios.get('http://localhost:3000/api/customers').then(res => setCustomers(res.data));
    axios.get('http://localhost:3000/api/services').then(res => setServices(res.data));
    axios.get('http://localhost:3000/api/warehouses').then(res => setWarehouses(res.data));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openEditModal = (pkg) => {
    setFormData(pkg);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      PackageID: '',
      Order_id: '',
      Sender_id: '',
      Receiver_id: '',
      Service_id: '',
      Weight: '',
      Dimensions: '',
      Description: '',
      Value: '',
      Current_Warehouse_id: '',
      Status: '',
      Estimated_delivery: '',
      Is_fragile: false,
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && formData.PackageID) {
        await axios.put(`http://localhost:3000/api/packages/${formData.PackageID}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/packages', formData);
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      console.error('Lỗi:', err.response?.data || err.message);
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm(`Xác nhận xoá kiện hàng ID ${id}?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/packages/${id}`);
      fetchAllData();
    } catch (err) {
      console.error('Lỗi khi xoá:', err.response?.data || err.message);
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.Order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.SenderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ReceiverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <section className="pa-section">
      <div className="pa-card">
        <div className="pa-card-header">
          <h3>Quản lý Kiện hàng</h3>
          <button className="pa-btn pa-btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Thêm Kiện hàng
          </button>
        </div>
        <input
          type="text"
          placeholder="Tìm theo mã đơn, người gửi, người nhận..."
          className="pa-form-group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px', marginBottom: '15px' }}
        />
        <table className="pa-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã đơn</th>
              <th>Người gửi</th>
              <th>Người nhận</th>
              <th>Dịch vụ</th>
              <th>Kho</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg.PackageID}>
                <td>{pkg.PackageID}</td>
                <td>{pkg.Order_code}</td>
                <td>{pkg.SenderName}</td>
                <td>{pkg.ReceiverName}</td>
                <td>{pkg.Service_name}</td>
                <td>{pkg.CurrentWarehouse}</td>
                <td>
                  <span className={`pa-badge ${pkg.Status === 'Đang giao' ? 'pa-badge-warning' : 'pa-badge-secondary'}`}>
                    {pkg.Status}
                  </span>
                </td>
                <td>
                  <button className="pa-btn pa-btn-warning pa-btn-sm" onClick={() => openEditModal(pkg)}>
                    <i className="fas fa-edit"></i> Sửa
                  </button>
                  <button className="pa-btn pa-btn-danger pa-btn-sm" onClick={() => deletePackage(pkg.PackageID)}>
                    <i className="fas fa-trash"></i> Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="pa-modal" style={{ display: 'block' }}>
          <div className="pa-modal-content">
            <div className="pa-modal-header">
              <h4>{editMode ? 'Sửa Kiện hàng' : 'Thêm Kiện hàng'}</h4>
              <span className="pa-close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="pa-form-group">
                <label>Người gửi:</label>
                <select value={formData.Sender_id} onChange={(e) => setFormData({ ...formData, Sender_id: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.Name}</option>)}
                </select>
              </div>
              <div className="pa-form-group">
                <label>Người nhận:</label>
                <select value={formData.Receiver_id} onChange={(e) => setFormData({ ...formData, Receiver_id: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.Name}</option>)}
                </select>
              </div>
              <div className="pa-form-group">
                <label>Dịch vụ:</label>
                <select value={formData.Service_id} onChange={(e) => setFormData({ ...formData, Service_id: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  {services.map(s => <option key={s.Service_id} value={s.Service_id}>{s.Service_name}</option>)}
                </select>
              </div>
              <div className="pa-form-group">
                <label>Kho hiện tại:</label>
                <select value={formData.Current_Warehouse_id} onChange={(e) => setFormData({ ...formData, Current_Warehouse_id: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.Name}</option>)}
                </select>
              </div>
              <div className="pa-form-group">
                <label>Khối lượng:</label>
                <input type="number" value={formData.Weight} onChange={(e) => setFormData({ ...formData, Weight: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Kích thước:</label>
                <input type="text" value={formData.Dimensions} onChange={(e) => setFormData({ ...formData, Dimensions: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Mô tả:</label>
                <textarea value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Giá trị:</label>
                <input type="number" value={formData.Value} onChange={(e) => setFormData({ ...formData, Value: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Trạng thái:</label>
                <input type="text" value={formData.Status} onChange={(e) => setFormData({ ...formData, Status: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Ngày giao dự kiến:</label>
                <input type="date" value={formData.Estimated_delivery} onChange={(e) => setFormData({ ...formData, Estimated_delivery: e.target.value })} />
              </div>
              <div className="pa-form-group">
                <label>Dễ vỡ:</label>
                <select value={formData.Is_fragile} onChange={(e) => setFormData({ ...formData, Is_fragile: e.target.value === 'true' })}>
                  <option value="false">Không</option>
                  <option value="true">Có</option>
                </select>
              </div>
              <button type="submit" className="pa-btn pa-btn-primary">Lưu</button>
              <button type="button" className="pa-btn pa-btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Package;
