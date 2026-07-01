import React, { useEffect, useState } from 'react';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    Customer_id: '',
    Order_id: '',
    Amount: '',
    Transansaction_type: '',
    Status: '',
    Description: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchCustomers();
    fetchOrders();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Lỗi khi lấy giao dịch:', err);
    }
  };

  const fetchCustomers = async () => {
    const res = await fetch('http://localhost:3000/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const fetchOrders = async () => {
    const res = await fetch('http://localhost:3000/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleSave = async () => {
    const payload = { ...formData, Amount: parseFloat(formData.Amount) || 0 };
    try {
      if (editId) {
        await fetch(`http://localhost:3000/api/transactions/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchTransactions();
      resetForm();
    } catch (err) {
      console.error('Lỗi khi lưu giao dịch:', err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Customer_id: item.Customer_id,
      Order_id: item.Order_id,
      Amount: item.Amount,
      Transansaction_type: item.Transansaction_type,
      Status: item.Status,
      Description: item.Description || ''
    });
    setEditId(item.Transaction_id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      Customer_id: '',
      Order_id: '',
      Amount: '',
      Transansaction_type: '',
      Status: '',
      Description: ''
    });
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="tr-section" style={{ padding: 30 }}>
      <div className="tr-card">
        <div className="tr-card-header">
          <h3>Lịch sử giao dịch</h3>
          <button className="tr-btn tr-btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>Thêm Giao dịch</button>
        </div>

        <table className="tr-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Mã đơn</th>
              <th>Số tiền</th>
              <th>Loại giao dịch</th>
              <th>Trạng thái</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tr => (
              <tr key={tr.Transaction_id}>
                <td>{tr.CustomerName}</td>
                <td>{tr.Order_code}</td>
                <td>{Number(tr.Amount).toLocaleString('vi-VN')} VNĐ</td>
                <td>{tr.Transansaction_type}</td>
                <td>{tr.Status}</td>
                <td>{tr.Description}</td>
                <td>
                  <button className="tr-btn tr-btn-warning tr-btn-sm" onClick={() => handleEdit(tr)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="tr-modal">
          <div className="tr-modal-content">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <h4>{editId ? 'Cập nhật Giao dịch' : 'Thêm Giao dịch'}</h4>

              <div className="tr-form-group">
                <label>Khách hàng</label>
                <select value={formData.Customer_id} onChange={(e) => setFormData({ ...formData, Customer_id: e.target.value })} required>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => (
                    <option key={c.CustomerID} value={c.CustomerID}>{c.Name}</option>
                  ))}
                </select>
              </div>

              <div className="tr-form-group">
                <label>Đơn hàng</label>
                <select value={formData.Order_id} onChange={(e) => setFormData({ ...formData, Order_id: e.target.value })}>
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map(o => (
                    <option key={o.OrderID} value={o.OrderID}>{o.Order_code}</option>
                  ))}
                </select>
              </div>

              <div className="tr-form-group">
                <label>Số tiền</label>
                <input type="number" value={formData.Amount} onChange={(e) => setFormData({ ...formData, Amount: e.target.value })} />
              </div>

              <div className="tr-form-group">
                <label>Loại giao dịch</label>
                <input type="text" value={formData.Transansaction_type} onChange={(e) => setFormData({ ...formData, Transansaction_type: e.target.value })} />
              </div>

              <div className="tr-form-group">
                <label>Trạng thái</label>
                <input type="text" value={formData.Status} onChange={(e) => setFormData({ ...formData, Status: e.target.value })} />
              </div>

              <div className="tr-form-group">
                <label>Mô tả</label>
                <textarea value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })}></textarea>
              </div>

              <button className="tr-btn tr-btn-primary" type="submit">Lưu</button>
              <button className="tr-btn tr-btn-secondary" type="button" onClick={resetForm}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
