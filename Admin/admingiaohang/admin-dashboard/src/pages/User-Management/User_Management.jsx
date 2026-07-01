import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './User_Management.css';

const User_Management = () => {
  const [view, setView] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  const convertDateToSQL = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  useEffect(() => {
    fetchCustomers();
    fetchStaffs();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
    }
  };

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/staff');
      setStaffs(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên:', err);
    }
  };
  const openModal = (item = null) => {
    setEditItem(item);
    if (view === 'customer') {
      setFormData(item || {
        Customer_type: '',
        Name: '',
        Phone: '',
        Street: '',
        Ward: '',
        District: '',
        City: ''
      });
    } else {
      setFormData(item ? {
        ...item,
        Employment_date: item.Employment_date ? item.Employment_date.slice(0, 10) : '',
        Is_active: !!item.Is_active
      } : {
        Name: '',
        Position: '',
        Phone: '',
        Email: '',
        Employment_date: '',
        Is_active: true
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditItem(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox'
        ? checked
        : id === 'Is_active'
          ? value === 'true'
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let dataToSend = { ...formData };

      if (view === 'staff') {
        dataToSend.Employment_date = convertDateToSQL(formData.Employment_date);
        dataToSend.Is_active = !!formData.Is_active;
      }

      if (view === 'staff') {
        if (editItem) {
          await axios.put(`http://localhost:3000/api/staff/${editItem.StaffID}`, dataToSend);
        } else {
          await axios.post('http://localhost:3000/api/staff', dataToSend);
        }
        fetchStaffs();
      } else {
        if (editItem) {
          await axios.put(`http://localhost:3000/api/customers/${editItem.CustomerID}`, formData);
        }
        fetchCustomers();
      }

      closeModal();
    } catch (err) {
      console.error('Lỗi khi lưu:', err.response?.data || err.message);
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xoá nhân viên ID ${id}?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/staff/${id}`);
        fetchStaffs();
      } catch (err) {
        console.error('Lỗi khi xoá nhân viên:', err);
      }
    }
  };
  const filteredCustomers = customers.filter(c =>
    c.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.Phone?.includes(searchTerm)
  );

  const filteredStaffs = staffs.filter(s =>
    s.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Email?.toLowerCase().includes(searchTerm)
  );

  return (
    <section className="um-section">
      <div className="um-card">
        <div className="um-card-header">
          <h3>Quản lý {view === 'customer' ? 'Khách hàng' : 'Nhân viên'}</h3>
          <div>
            <button className="um-btn um-btn-primary" onClick={() => setView('customer')}>Khách hàng</button>
            <button className="um-btn um-btn-primary" onClick={() => setView('staff')}>Nhân viên</button>
           {view === 'staff' && (
  <button className="um-btn um-btn-primary" onClick={() => openModal(null)}>Thêm</button>
)}

          </div>
        </div>

        <input
          type="text"
          className="um-form-group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
          style={{ width: 'auto', padding: '8px 12px', marginBottom: '15px' }}
        />

        {view === 'customer' && (
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại</th>
                <th>Tên</th>
                <th>Điện thoại</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(cust => (
                <tr key={cust.CustomerID}>
                  <td>{cust.CustomerID}</td>
                  <td>{cust.Customer_type}</td>
                  <td>{cust.Name}</td>
                  <td>{cust.Phone}</td>
                  <td>{`${cust.Street}, ${cust.Ward}, ${cust.District}, ${cust.City}`}</td>
                  <td>
                    <button className="um-btn um-btn-warning um-btn-sm" onClick={() => openModal(cust)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'staff' && (
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Chức vụ</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.map(stf => (
                <tr key={stf.StaffID}>
                  <td>{stf.StaffID}</td>
                  <td>{stf.Name}</td>
                  <td>{stf.Position}</td>
                  <td>{stf.Phone}</td>
                  <td>{stf.Email}</td>
                  <td>{stf.Employment_date?.slice(0, 10)}</td>
                  <td>
                    <span className={`um-badge ${stf.Is_active ? 'um-badge-success' : 'um-badge-secondary'}`}>
                      {stf.Is_active ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <button className="um-btn um-btn-warning um-btn-sm" onClick={() => openModal(stf)}>Sửa</button>
                    <button className="um-btn um-btn-danger um-btn-sm" onClick={() => deleteStaff(stf.StaffID)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalVisible && (
        <div className="um-modal" style={{ display: 'block' }}>
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h4>{editItem ? 'Sửa' : 'Thêm'} {view === 'staff' ? 'Nhân viên' : 'Khách hàng'}</h4>
              <span className="um-close-btn" onClick={closeModal}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              {view === 'staff' ? (
                <>
                  <div className="um-form-group">
                    <label htmlFor="Name">Tên:</label>
                    <input type="text" id="Name" value={formData.Name} onChange={handleChange} required />
                  </div>
               <div className="um-form-group">
  <label htmlFor="Position">Chức vụ:</label>
  <select id="Position" value={formData.Position} onChange={handleChange} required>
    <option value="">-- Chọn chức vụ --</option>
    <option value="Nhân viên kho">Nhân viên kho</option>
    <option value="Lái xe">Lái xe</option>
    <option value="Nhân viên vận chuyển">Nhân viên vận chuyển</option>
    <option value="Admin">Admin</option>
  </select>
</div>

                  <div className="um-form-group">
                    <label htmlFor="Phone">Điện thoại:</label>
                    <input type="text" id="Phone" value={formData.Phone} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Email">Email:</label>
                    <input type="email" id="Email" value={formData.Email} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Employment_date">Ngày vào làm:</label>
                    <input type="date" id="Employment_date" value={formData.Employment_date} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Is_active">Trạng thái:</label>
                    <select id="Is_active" value={formData.Is_active ? 'true' : 'false'} onChange={handleChange}>
                      <option value="true">Hoạt động</option>
                      <option value="false">Không hoạt động</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
             <div className="um-form-group">
  <label htmlFor="Customer_type">Loại:</label>
  <select id="Customer_type" value={formData.Customer_type} onChange={handleChange} required>
    <option value="">-- Chọn loại --</option>
    <option value="Người gửi">Người gửi</option>
    <option value="Người nhận">Người nhận</option>
  </select>
</div>

                  <div className="um-form-group">
                    <label htmlFor="Name">Tên:</label>
                    <input type="text" id="Name" value={formData.Name} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Phone">Số điện thoại:</label>
                    <input type="text" id="Phone" value={formData.Phone} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Street">Đường:</label>
                    <input type="text" id="Street" value={formData.Street} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="Ward">Phường:</label>
                    <input type="text" id="Ward" value={formData.Ward} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="District">Quận:</label>
                    <input type="text" id="District" value={formData.District} onChange={handleChange} />
                  </div>
                  <div className="um-form-group">
                    <label htmlFor="City">Thành phố:</label>
                    <input type="text" id="City" value={formData.City} onChange={handleChange} />
                  </div>
                </>
              )}
              <button type="submit" className="um-btn um-btn-primary">Lưu</button>
              <button type="button" className="um-btn um-btn-secondary" onClick={closeModal}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default User_Management;
