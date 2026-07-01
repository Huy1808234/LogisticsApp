import React, { useState, useEffect } from 'react';
import './Vehicle.css';

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);

  const [newVehicle, setNewVehicle] = useState({
    Vehicle_type: '',
    License_plate: '',
    capacity_weight: '',
    Current_wh_id: '',
    Status: '',
    Last_maintenance: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchWarehouses();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/vehicles');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Lỗi khi lấy phương tiện:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error('Lỗi khi lấy kho:', err);
    }
  };

  const handleSaveVehicle = async () => {
    const payload = {
      ...newVehicle,
      capacity_weight: Number(newVehicle.capacity_weight) || 0,
    };

    try {
      if (editVehicleId) {
        await fetch(`http://localhost:3000/api/vehicles/${editVehicleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('http://localhost:3000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.error('Lỗi khi lưu phương tiện:', err);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setNewVehicle({
      Vehicle_type: vehicle.Vehicle_type || '',
      License_plate: vehicle.License_plate || '',
      capacity_weight: vehicle.capacity_weight || '',
      Current_wh_id: vehicle.Current_wh_id || '',
      Status: vehicle.Status || '',
      Last_maintenance: vehicle.Last_maintenance?.split('T')[0] || '',
    });
    setEditVehicleId(vehicle.VehicleID);
    setShowModal(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá phương tiện này?')) {
      try {
        await fetch(`http://localhost:3000/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        fetchVehicles();
      } catch (err) {
        console.error('Lỗi khi xoá phương tiện:', err);
      }
    }
  };

  const resetForm = () => {
    setNewVehicle({
      Vehicle_type: '',
      License_plate: '',
      capacity_weight: '',
      Current_wh_id: '',
      Status: '',
      Last_maintenance: ''
    });
    setEditVehicleId(null);
    setShowModal(false);
  };

  return (
    <div className="vh-section" style={{ padding: 30 }}>
      <div className="vh-card">
        <div className="vh-card-header">
          <h3>Quản lý phương tiện</h3>
          <button className="vh-btn vh-btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            Thêm Phương tiện
          </button>
        </div>

        <table className="vh-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Biển số</th>
              <th>Trọng tải</th>
              <th>Kho hiện tại</th>
              <th>Trạng thái</th>
              <th>Bảo trì lần cuối</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.VehicleID}>
                <td>{vehicle.Vehicle_type}</td>
                <td>{vehicle.License_plate}</td>
                <td>{vehicle.capacity_weight}</td>
                <td>{vehicle.CurrentWarehouse}</td>
                <td>{vehicle.Status}</td>
                <td>{vehicle.Last_maintenance?.split('T')[0]}</td>
                <td>
                  <button className="vh-btn vh-btn-warning vh-btn-sm" onClick={() => handleEditVehicle(vehicle)}>Sửa</button>
                  <button className="vh-btn vh-btn-danger vh-btn-sm" onClick={() => handleDeleteVehicle(vehicle.VehicleID)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="vh-modal">
          <div className="vh-modal-content">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveVehicle(); }}>
              <h4>{editVehicleId ? 'Cập nhật Phương tiện' : 'Thêm Phương tiện'}</h4>

              <div className="vh-form-group">
                <label>Loại phương tiện</label>
                <input type="text" value={newVehicle.Vehicle_type} onChange={(e) => setNewVehicle({ ...newVehicle, Vehicle_type: e.target.value })} required />
              </div>

              <div className="vh-form-group">
                <label>Biển số</label>
                <input type="text" value={newVehicle.License_plate} onChange={(e) => setNewVehicle({ ...newVehicle, License_plate: e.target.value })} required />
              </div>

              <div className="vh-form-group">
                <label>Trọng tải (kg)</label>
                <input type="number" value={newVehicle.capacity_weight} onChange={(e) => setNewVehicle({ ...newVehicle, capacity_weight: e.target.value })} />
              </div>

              <div className="vh-form-group">
                <label>Kho hiện tại</label>
                <select value={newVehicle.Current_wh_id} onChange={(e) => setNewVehicle({ ...newVehicle, Current_wh_id: e.target.value })}>
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map(w => (
                    <option key={w.WarehouseID} value={w.WarehouseID}>{w.Name}</option>
                  ))}
                </select>
              </div>

   <div className="vh-form-group">
  <label>Trạng thái</label>
  <select
    className="vh-select"
    value={newVehicle.Status}
    onChange={(e) => setNewVehicle({ ...newVehicle, Status: e.target.value })}
    required
  >
    <option value="">-- Chọn trạng thái --</option>
    <option value="Hoạt động">Hoạt động</option>
    <option value="Bảo trì">Bảo trì</option>
    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
  </select>
</div>



              <div className="vh-form-group">
                <label>Ngày bảo trì gần nhất</label>
                <input type="date" value={newVehicle.Last_maintenance} onChange={(e) => setNewVehicle({ ...newVehicle, Last_maintenance: e.target.value })} />
              </div>

              <button className="vh-btn vh-btn-primary" type="submit">Lưu</button>
              <button className="vh-btn vh-btn-secondary" type="button" onClick={resetForm}>Hủy</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle;
