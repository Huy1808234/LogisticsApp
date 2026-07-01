import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Service.css';

const Service = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    Service_id: '',
    Service_name: '',
    Description: '',
    Price: '',
    Delivery_time_min: '',
    Delivery_time_max: '',
    Is_active: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchServices = () => {
    axios.get('http://localhost:3000/api/services')
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => console.error('Lỗi khi fetch:', err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openEditModal = (service) => {
    setFormData(service);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      Service_id: '',
      Service_name: '',
      Description: '',
      Price: '',
      Delivery_time_min: '',
      Delivery_time_max: '',
      Is_active: true,
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };

    try {
      if (editMode && formData.Service_id) {
        await axios.put(`http://localhost:3000/api/services/${formData.Service_id}`, payload);
      } else {
        await axios.post('http://localhost:3000/api/services', payload);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Lỗi khi thêm/sửa:', err);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn xoá dịch vụ ID ${id}?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
    }
  };

  const filteredServices = services.filter((s) =>
    s.Service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bi-section">
      <div className="bi-card">
        <div className="bi-card-header">
          <h3>Quản lý dịch vụ vận chuyển</h3>
          <button className="bi-btn bi-btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Thêm Dịch vụ
          </button>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ..."
          className="bi-form-group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px', marginBottom: '15px' }}
        />
        <table className="bi-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Dịch vụ</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Thời gian Giao hàng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.Service_id}>
                <td>{service.Service_id}</td>
                <td>{service.Service_name}</td>
                <td>{service.Description}</td>
                <td>{service.Price}</td>
                <td>{service.Delivery_time_min} - {service.Delivery_time_max} phút</td>
                <td>
                  <span className={`bi-badge ${service.Is_active ? 'bi-badge-success' : 'bi-badge-secondary'}`}>
                    {service.Is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button className="bi-btn bi-btn-warning bi-btn-sm" onClick={() => openEditModal(service)}>
                    <i className="fas fa-edit"></i> Sửa
                  </button>
                  <button className="bi-btn bi-btn-danger bi-btn-sm" onClick={() => deleteService(service.Service_id)}>
                    <i className="fas fa-trash"></i> Xoá
                  </button>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có dịch vụ nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="bi-modal" style={{ display: 'block' }}>
          <div className="bi-modal-content">
            <div className="bi-modal-header">
              <h4>{editMode ? 'Sửa Dịch vụ' : 'Thêm Dịch vụ'}</h4>
              <span className="bi-close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="bi-form-group">
  <label>Tên Dịch vụ:</label>
  <select
    value={formData.Service_name}
    onChange={(e) => setFormData({ ...formData, Service_name: e.target.value })}
    required
  >
    <option value="">-- Chọn dịch vụ --</option>
    <option value="Giao hàng tiết kiệm">Giao hàng tiết kiệm</option>
    <option value="Hỏa tốc">Hỏa tốc</option>
  </select>
</div>

              <div className="bi-form-group">
                <label>Mô tả:</label>
                <textarea value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} />
              </div>
              <div className="bi-form-group">
                <label>Giá:</label>
                <input type="number" value={formData.Price} onChange={(e) => setFormData({ ...formData, Price: e.target.value })} required />
              </div>
              <div className="bi-form-group">
                <label>Thời gian giao hàng tối thiểu (phút):</label>
                <input type="number" value={formData.Delivery_time_min} onChange={(e) => setFormData({ ...formData, Delivery_time_min: e.target.value })} required />
              </div>
              <div className="bi-form-group">
                <label>Thời gian giao hàng tối đa (phút):</label>
                <input type="number" value={formData.Delivery_time_max} onChange={(e) => setFormData({ ...formData, Delivery_time_max: e.target.value })} required />
              </div>
              <div className="bi-form-group">
                <label>Trạng thái:</label>
                <select value={formData.Is_active} onChange={(e) => setFormData({ ...formData, Is_active: e.target.value === 'true' })}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <button type="submit" className="bi-btn bi-btn-primary">Lưu</button>
              <button type="button" className="bi-btn bi-btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Service;
