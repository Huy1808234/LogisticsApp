import React, { useState, useEffect } from 'react';
import './Order_Management.css';

const Order_Management = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);

  const [newOrder, setNewOrder] = useState({
    Order_code: '',
    Sender_id: '',
    Service_id: '',
    Total_package: '',
    Total_weight: '',
    Ship_cost: '',
    Payment_status: '',
    Order_status: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchServices();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Lỗi khi lấy khách hàng:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Lỗi khi lấy dịch vụ:', err);
    }
  };
  const handleAddOrder = async () => {
    const {
      Order_code, Sender_id, Service_id,
      Total_package, Total_weight,
      Ship_cost, Payment_status, Order_status
    } = newOrder;

    if (!Order_code || !Sender_id || !Service_id) return;

    const payload = {
      Order_code,
      Sender_id,
      Service_id,
      Total_package: Total_package || 0,
      Total_weight: Total_weight || 0,
      Ship_cost: Ship_cost || 0,
      Payment_status: Payment_status || 'Chưa thanh toán',
      Order_status: Order_status || 'Mới tạo'
    };

    try {
      if (editOrderId) {
        await fetch(`http://localhost:3000/api/orders/${editOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      fetchOrders();
    } catch (err) {
      console.error('Lỗi khi thêm/cập nhật đơn hàng:', err);
    }
  };

  const handleEditOrder = (order) => {
    setNewOrder({
      Order_code: order.Order_code || '',
      Sender_id: order.Sender_id || '',
      Service_id: order.Service_id || '',
      Total_package: order.Total_package || '',
      Total_weight: order.Total_weight || '',
      Ship_cost: order.Ship_cost || '',
      Payment_status: order.Payment_status || '',
      Order_status: order.Order_status || ''
    });
    setEditOrderId(order.OrderID);
    setShowModal(true);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá đơn hàng này?')) {
      try {
        await fetch(`http://localhost:3000/api/orders/${id}`, { method: 'DELETE' });
        fetchOrders();
      } catch (err) {
        console.error('Lỗi khi xoá đơn hàng:', err);
      }
    }
  };

  const resetForm = () => {
    setNewOrder({
      Order_code: '',
      Sender_id: '',
      Service_id: '',
      Total_package: '',
      Total_weight: '',
      Ship_cost: '',
      Payment_status: '',
      Order_status: ''
    });
    setEditOrderId(null);
    setShowModal(false);
  };

  return (
    <div className="om-section" style={{ padding: 30 }}>
      <div className="om-card">
        <div className="om-card-header">
          <h3>Quản lý Đơn hàng</h3>
          <button className="om-btn om-btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            Thêm Đơn hàng
          </button>
        </div>

        <table className="om-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Người gửi</th>
              <th>Dịch vụ</th>
              <th>Số kiện</th>
              <th>Khối lượng</th>
              <th>Phí</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.OrderID}>
                <td>{order.Order_code}</td>
                <td>{order.SenderName}</td>
                <td>{order.Service_name}</td>
                <td>{order.Total_package}</td>
                <td>{order.Total_weight}</td>
                <td>{order.Ship_cost}</td>
                <td>{order.Payment_status}</td>
                <td>{order.Order_status}</td>
                <td>
                  <button className="om-btn om-btn-warning om-btn-sm" onClick={() => handleEditOrder(order)}>Sửa</button>
                  <button className="om-btn om-btn-danger om-btn-sm" onClick={() => handleDeleteOrder(order.OrderID)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="om-modal">
          <div className="om-modal-content">
            <form onSubmit={(e) => { e.preventDefault(); handleAddOrder(); }}>
              <h4>{editOrderId ? 'Cập nhật Đơn hàng' : 'Thêm Đơn hàng'}</h4>

              <div className="om-form-group">
                <label>Mã đơn hàng</label>
                <input type="text" value={newOrder.Order_code} onChange={(e) => setNewOrder({ ...newOrder, Order_code: e.target.value })} required />
              </div>

              <div className="om-form-group">
                <label>Người gửi</label>
                <select value={newOrder.Sender_id} onChange={(e) => setNewOrder({ ...newOrder, Sender_id: e.target.value })} required>
                  <option value="">-- Chọn người gửi --</option>
                  {customers.map((s) => (
                    <option key={s.CustomerID} value={s.CustomerID}>{s.Name}</option>
                  ))}
                </select>
              </div>

              <div className="om-form-group">
                <label>Dịch vụ</label>
                <select value={newOrder.Service_id} onChange={(e) => setNewOrder({ ...newOrder, Service_id: e.target.value })} required>
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map((s) => (
                    <option key={s.Service_id} value={s.Service_id}>{s.Service_name}</option>
                  ))}
                </select>
              </div>

              <div className="om-form-group">
                <label>Số kiện</label>
                <input type="number" value={newOrder.Total_package} onChange={(e) => setNewOrder({ ...newOrder, Total_package: e.target.value })} />
              </div>

              <div className="om-form-group">
                <label>Khối lượng</label>
                <input type="number" value={newOrder.Total_weight} onChange={(e) => setNewOrder({ ...newOrder, Total_weight: e.target.value })} />
              </div>

              <div className="om-form-group">
                <label>Phí vận chuyển</label>
                <input type="number" value={newOrder.Ship_cost} onChange={(e) => setNewOrder({ ...newOrder, Ship_cost: e.target.value })} />
              </div>
<div className="om-form-group">
  <label>Trạng thái thanh toán</label>
  <select
    value={newOrder.Payment_status}
    onChange={(e) => setNewOrder({ ...newOrder, Payment_status: e.target.value })}
    required
  >
    <option value="">-- Chọn trạng thái --</option>
    <option value="Chưa thanh toán">Chưa thanh toán</option>
    <option value="Đã thanh toán">Đã thanh toán</option>
  </select>
</div>

<div className="om-form-group">
  <label>Trạng thái đơn hàng</label>
  <select
    value={newOrder.Order_status}
    onChange={(e) => setNewOrder({ ...newOrder, Order_status: e.target.value })}
    required
  >
    <option value="">-- Chọn trạng thái --</option>
    <option value="Mới tạo">Mới tạo</option>
    <option value="Đang giao">Đang giao</option>
    <option value="Hoàn thành">Hoàn thành</option>
    <option value="Thất bại">Thất bại</option>
  </select>
</div>
              <button className="om-btn om-btn-primary" type="submit">Lưu</button>
              <button className="om-btn om-btn-secondary" type="button" onClick={resetForm}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order_Management;
