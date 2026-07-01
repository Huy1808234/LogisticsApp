import React, { useState, useEffect } from 'react';
import './Payment_Management.css';

const Payment_Management = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({
    Order_id: '',
    Payment_method: '',
    Amount: '',
    Payment_date: '',
    Transaction_id: '',
    Notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    fetch('http://localhost:3000/api/payments')
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(err => console.error('Lỗi khi tải danh sách thanh toán:', err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const method = formMode === 'add' ? 'POST' : 'PUT';
    const url = formMode === 'add'
      ? 'http://localhost:3000/api/payments'
      : `http://localhost:3000/api/payments/${selectedPayment.PaymentID}`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        fetchPayments();
        closeFormModal();
      })
      .catch(err => console.error('Lỗi khi lưu thanh toán:', err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá thanh toán này?')) {
      fetch(`http://localhost:3000/api/payments/${id}`, {
        method: 'DELETE'
      })
        .then(() => fetchPayments())
        .catch(err => console.error('Lỗi khi xoá thanh toán:', err));
    }
  };

  const openAddForm = () => {
    setFormMode('add');
    setFormData({
      Order_id: '',
      Payment_method: '',
      Amount: '',
      Payment_date: '',
      Transaction_id: '',
      Notes: ''
    });
    setShowFormModal(true);
  };

  const openEditForm = (payment) => {
    setFormMode('edit');
    setSelectedPayment(payment);
    setFormData({
      Order_id: payment.Order_id,
      Payment_method: payment.Payment_method,
      Amount: payment.Amount,
      Payment_date: payment.Payment_date ? payment.Payment_date.substring(0, 10) : '',
      Transaction_id: payment.Transaction_id,
      Notes: payment.Notes
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedPayment(null);
    setFormData({
      Order_id: '',
      Payment_method: '',
      Amount: '',
      Payment_date: '',
      Transaction_id: '',
      Notes: ''
    });
  };

  const filteredPayments = payments.filter(payment =>
    (`${payment.PaymentID}${payment.Order_id}${payment.Order_code}`)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section id="paymentManagement" className="pm-content-section">
      <div className="pm-card">
        <div className="pm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#28a745', fontWeight: 'bold' }}>Quản lý thanh toán</h3>
       <button className="pm-btn pm-btn-primary" onClick={openAddForm}>Thêm thanh toán</button>

        </div>

        <input
          type="text"
          className="form-group"
          placeholder="Tìm kiếm thanh toán (ID đơn, ID thanh toán)..."
          style={{ width: 'auto', padding: '8px 12px', marginBottom: 15 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="pm-table">
          <thead>
            <tr>
              <th>ID Thanh toán</th>
              <th>ID Đơn hàng</th>
              <th>Mã đơn</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Ngày thanh toán</th>
              <th>Giao dịch</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.PaymentID}>
                <td>#{payment.PaymentID}</td>
                <td>#{payment.Order_id}</td>
                <td>{payment.Order_code || '—'}</td>
                <td>{Number(payment.Amount).toLocaleString('vi-VN')} VNĐ</td>
                <td>{payment.Payment_method}</td>
                <td>{new Date(payment.Payment_date).toLocaleDateString('vi-VN')}</td>
                <td>{payment.Transaction_id}</td>
                <td>{payment.Notes}</td>
                <td>
                  <button className="pm-btn pm-btn-info" onClick={() => setSelectedPayment(payment)}>Xem</button>
                  <button className="pm-btn pm-btn-edit" onClick={() => openEditForm(payment)}>Sửa</button>
                  <button className="pm-btn pm-btn-delete" onClick={() => handleDelete(payment.PaymentID)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && !showFormModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Chi tiết thanh toán</h4>
              <span className="close-btn" onClick={() => setSelectedPayment(null)}>&times;</span>
            </div>
            <div className="form-group"><strong>ID Thanh toán:</strong> #{selectedPayment.PaymentID}</div>
            <div className="form-group"><strong>ID Đơn hàng:</strong> #{selectedPayment.Order_id}</div>
            <div className="form-group"><strong>Mã đơn hàng:</strong> {selectedPayment.Order_code || '—'}</div>
            <div className="form-group"><strong>Số tiền:</strong> {Number(selectedPayment.Amount).toLocaleString('vi-VN')} VNĐ</div>
            <div className="form-group"><strong>Phương thức:</strong> {selectedPayment.Payment_method}</div>
            <div className="form-group"><strong>Ngày thanh toán:</strong> {new Date(selectedPayment.Payment_date).toLocaleDateString('vi-VN')}</div>
            <div className="form-group"><strong>Mã giao dịch:</strong> {selectedPayment.Transaction_id}</div>
            <div className="form-group"><strong>Ghi chú:</strong> {selectedPayment.Notes}</div>
            <div style={{ textAlign: 'right' }}>
              <button className="pm-btn pm-btn-secondary" onClick={() => setSelectedPayment(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h4 style={{ color: '#000', fontWeight: 'bold', margin: 0 }}>
                {formMode === 'add' ? 'Thêm thanh toán' : 'Cập nhật thanh toán'}
              </h4>
              <span className="close-btn" onClick={closeFormModal}>&times;</span>
            </div>
            <div className="form-group">
              <label>ID đơn hàng:</label>
              <input type="text" name="Order_id" value={formData.Order_id} onChange={handleInputChange} />

              <label>Phương thức:</label>
              <select
                name="Payment_method"
                value={formData.Payment_method}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '1em' }}
              >
                <option value="">-- Chọn phương thức --</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Ví điện tử">Ví điện tử</option>
                <option value="COD">COD</option>
              </select>

              <label>Số tiền:</label>
              <input type="number" name="Amount" value={formData.Amount} onChange={handleInputChange} />

              <label>Ngày thanh toán:</label>
              <input type="date" name="Payment_date" value={formData.Payment_date} onChange={handleInputChange} />

              <label>Mã giao dịch:</label>
              <input type="text" name="Transaction_id" value={formData.Transaction_id} onChange={handleInputChange} />

              <label>Ghi chú:</label>
              <input type="text" name="Notes" value={formData.Notes} onChange={handleInputChange} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="pm-btn pm-btn-primary" onClick={handleSubmit}>
                {formMode === 'add' ? 'Thêm' : 'Lưu'}
              </button>
              <button className="pm-btn pm-btn-secondary" onClick={closeFormModal}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Payment_Management;
