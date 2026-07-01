import React, { useState, useEffect } from 'react';
import './Warehouse_Setup.css';

const Warehouse_Setup = () => {
  const [routes, setRoutes] = useState([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editRouteId, setEditRouteId] = useState(null);
  const [newRoute, setNewRoute] = useState({
    Route_code: '', Vehicle_id: '', Driver_id: '',
    Start_wh_id: '', End_wh_id: '',
    Departure_time: '', Estimated_time: '', Actual_time: '', Status: ''
  });

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [editPointId, setEditPointId] = useState(null);
  const [newPoint, setNewPoint] = useState({
    Warehouse_id: '', Sequence_number: '', Estimated_arrival: '', Actual_arrival: '', Status: ''
  });

  const [warehouses, setWarehouses] = useState([]);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editWarehouseId, setEditWarehouseId] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({
    Name: '', Street: '', Ward: '', District: '', City: '', Manager_id: ''
  });

  useEffect(() => {
    fetchRoutes();
    fetchWarehouses();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/routes');
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error('Lỗi fetch routes:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error('Lỗi fetch warehouses:', err);
    }
  };

  const fetchRoutePoints = async (routeId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/routes/${routeId}/points`);
      const data = await res.json();
      setRoutePoints(data);
      setSelectedRoute(routeId);
    } catch (err) {
      console.error('Lỗi fetch điểm dừng:', err);
    }
  };

  const toInputDatetimeLocal = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  const offset = d.getTimezoneOffset(); 
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};
  const formatDateTimeVN = (dt) => {
    if (!dt) return '';
    const date = new Date(dt);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleAddRoute = async () => {
    const {
      Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
      Departure_time, Estimated_time, Actual_time, Status
    } = newRoute;

    if (!Route_code || !Start_wh_id || !End_wh_id) return;

    const payload = {
      Route_code,
      Vehicle_id: Vehicle_id || null,
      Driver_id: Driver_id || null,
      Start_wh_id,
      End_wh_id,
      Departure_time: Departure_time || null,
      Estimated_time: Estimated_time || null,
      Actual_time: Actual_time || null,
      Status: Status || 'Đang lên kế hoạch'
    };

    try {
      if (editRouteId) {
        await fetch(`http://localhost:3000/api/routes/${editRouteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      resetRouteForm();
      fetchRoutes();
    } catch (err) {
      console.error('Lỗi thêm/cập nhật tuyến:', err);
    }
  };

  const handleEditRoute = (route) => {
    setNewRoute({
      Route_code: route.Route_code || '',
      Vehicle_id: route.Vehicle_id || '',
      Driver_id: route.Driver_id || '',
      Start_wh_id: route.Start_wh_id || '',
      End_wh_id: route.End_wh_id || '',
      Departure_time: route.Departure_time || '',
      Estimated_time: route.Estimated_time || '',
      Actual_time: route.Actual_time || '',
      Status: route.Status || ''
    });
    setEditRouteId(route.RouteID);
    setShowRouteModal(true);
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tuyến này?')) {
      try {
        await fetch(`http://localhost:3000/api/routes/${id}`, { method: 'DELETE' });
        fetchRoutes();
      } catch (err) {
        console.error('Lỗi xoá tuyến:', err);
      }
    }
  };

  const resetRouteForm = () => {
    setNewRoute({
      Route_code: '', Vehicle_id: '', Driver_id: '',
      Start_wh_id: '', End_wh_id: '',
      Departure_time: '', Estimated_time: '', Actual_time: '', Status: ''
    });
    setEditRouteId(null);
    setShowRouteModal(false);
  };

  const handleAddPoint = async () => {
    const { Warehouse_id, Sequence_number, Estimated_arrival, Actual_arrival, Status } = newPoint;
    if (!Warehouse_id || !Sequence_number) return;

    const payload = { Warehouse_id, Sequence_number, Estimated_arrival, Actual_arrival, Status };

    try {
      if (editPointId) {
        await fetch(`http://localhost:3000/api/route-points/${editPointId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`http://localhost:3000/api/routes/${selectedRoute}/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      resetPointForm();
      fetchRoutePoints(selectedRoute);
    } catch (err) {
      console.error('Lỗi thêm/cập nhật điểm dừng:', err);
    }
  };

  const handleEditPoint = (point) => {
    setNewPoint({
      Warehouse_id: point.Warehouse_id,
      Sequence_number: point.Sequence_number,
      Estimated_arrival: point.Estimated_arrival,
      Actual_arrival: point.Actual_arrival,
      Status: point.Status
    });
    setEditPointId(point.Route_pointID);
    setShowPointModal(true);
  };

  const handleDeletePoint = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá điểm dừng này?')) {
      try {
        await fetch(`http://localhost:3000/api/route-points/${id}`, { method: 'DELETE' });
        fetchRoutePoints(selectedRoute);
      } catch (err) {
        console.error('Lỗi xoá điểm dừng:', err);
      }
    }
  };

  const resetPointForm = () => {
    setNewPoint({ Warehouse_id: '', Sequence_number: '', Estimated_arrival: '', Actual_arrival: '', Status: '' });
    setEditPointId(null);
    setShowPointModal(false);
  };

  const handleAddWarehouse = async () => {
    const { Name, Street, Ward, District, City, Manager_id } = newWarehouse;
    if (!Name || !City) return;

    const payload = { Name, Street, Ward, District, City, Manager_id };

    try {
      if (editWarehouseId) {
        await fetch(`http://localhost:3000/api/warehouses/${editWarehouseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/api/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      resetWarehouseForm();
      fetchWarehouses();
    } catch (err) {
      console.error('Lỗi thêm/cập nhật kho:', err);
    }
  };

  const handleEditWarehouse = (warehouse) => {
    setNewWarehouse({
      Name: warehouse.Name || '',
      Street: warehouse.Street || '',
      Ward: warehouse.Ward || '',
      District: warehouse.District || '',
      City: warehouse.City || '',
      Manager_id: warehouse.Manager_id || ''
    });
    setEditWarehouseId(warehouse.WarehouseID);
    setShowWarehouseModal(true);
  };

  const handleDeleteWarehouse = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá kho này?')) {
      try {
        await fetch(`http://localhost:3000/api/warehouses/${id}`, { method: 'DELETE' });
        fetchWarehouses();
      } catch (err) {
        console.error('Lỗi xoá kho:', err);
      }
    }
  };

  const resetWarehouseForm = () => {
    setNewWarehouse({ Name: '', Street: '', Ward: '', District: '', City: '', Manager_id: '' });
    setEditWarehouseId(null);
    setShowWarehouseModal(false);
  };

  return (
    <div className="wh-wrapper" style={{ padding: 30 }}>
      <div className="wh-card">
        <div className="wh-card-header">
          <h3>Thiết lập Tuyến đường</h3>
          <button className="wh-btn wh-btn-primary" onClick={() => {
            resetRouteForm();
            setShowRouteModal(true);
          }}>Thêm Tuyến đường</button>
        </div>
        <table className="wh-table">
          <thead>
            <tr>
              <th>Mã Tuyến</th>
              <th>Kho bắt đầu</th>
              <th>Kho kết thúc</th>
              <th>Thời gian xuất phát</th>
              <th>Thời gian dự kiến</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.RouteID}>
                <td>{route.Route_code}</td>
                <td>{route.StartWarehouse}</td>
                <td>{route.EndWarehouse}</td>
                <td>{formatDateTimeVN(route.Departure_time)}</td>
                <td>{formatDateTimeVN(route.Estimated_time)}</td>
                <td>{route.Status}</td>
                <td>
                  <button className="wh-btn wh-btn-warning wh-btn-sm" onClick={() => handleEditRoute(route)}>Sửa</button>
                  <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => handleDeleteRoute(route.RouteID)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

   {showRouteModal && (
  <div className="modal">
    <div className="modal-content">
      <form onSubmit={(e) => { e.preventDefault(); handleAddRoute(); }}>
        <h4>{editRouteId ? 'Cập nhật Tuyến đường' : 'Thêm Tuyến đường'}</h4>

        <div className="form-group">
          <label>Mã tuyến:</label>
          <input type="text" value={newRoute.Route_code} onChange={e => setNewRoute({ ...newRoute, Route_code: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Kho bắt đầu:</label>
          <select value={newRoute.Start_wh_id} onChange={e => setNewRoute({ ...newRoute, Start_wh_id: e.target.value })} required>
            <option value="">-- Chọn kho --</option>
            {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.Name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Kho kết thúc:</label>
          <select value={newRoute.End_wh_id} onChange={e => setNewRoute({ ...newRoute, End_wh_id: e.target.value })} required>
            <option value="">-- Chọn kho --</option>
            {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.Name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Thời gian xuất phát:</label>
         <input
  type="datetime-local"
  value={toInputDatetimeLocal(newRoute.Departure_time)}
  onChange={e => setNewRoute({ ...newRoute, Departure_time: e.target.value })}
/>

        </div>

        <div className="form-group">
          <label>Thời gian dự kiến:</label>
          <input
  type="datetime-local"
  value={toInputDatetimeLocal(newRoute.Estimated_time)}
  onChange={e => setNewRoute({ ...newRoute, Estimated_time: e.target.value })}
/>
        </div>

        <div className="form-group">
          <label>Thời gian thực tế:</label>
          <input type="text" value={newRoute.Actual_time} onChange={e => setNewRoute({ ...newRoute, Actual_time: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Trạng thái:</label>
          <input type="text" value={newRoute.Status} onChange={e => setNewRoute({ ...newRoute, Status: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary">Lưu</button>
        <button type="button" className="btn btn-secondary" onClick={resetRouteForm}>Hủy</button>
      </form>
    </div>
  </div>
)}

    {selectedRoute && (
      <div className="wh-card" style={{ marginTop: 30 }}>
        <div className="wh-card-header">
          <h3>Điểm dừng cho Tuyến #{selectedRoute}</h3>
          <button className="wh-btn wh-btn-primary" onClick={() => {
            resetPointForm();
            setShowPointModal(true);
          }}>Thêm Điểm dừng</button>
        </div>
        <table className="wh-table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Kho</th>
              <th>Giờ đến dự kiến</th>
              <th>Giờ đến thực tế</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {routePoints.map(p => (
              <tr key={p.Route_pointID}>
                <td>{p.Sequence_number}</td>
                <td>{p.WarehouseName}</td>
                <td>{p.Estimated_arrival}</td>
                <td>{p.Actual_arrival}</td>
                <td>{p.Status}</td>
                <td>
                  <button className="wh-btn wh-btn-warning wh-btn-sm" onClick={() => handleEditPoint(p)}>Sửa</button>
                  <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => handleDeletePoint(p.Route_pointID)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

   {showPointModal && (
  <div className="modal">
    <div className="modal-content">
      <form onSubmit={(e) => { e.preventDefault(); handleAddPoint(); }}>
        <h4>{editPointId ? 'Cập nhật điểm dừng' : 'Thêm điểm dừng'}</h4>

        <div className="form-group">
          <label>Kho hàng:</label>
          <select value={newPoint.Warehouse_id} onChange={e => setNewPoint({ ...newPoint, Warehouse_id: e.target.value })} required>
            <option value="">-- Chọn kho --</option>
            {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.Name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Thứ tự dừng:</label>
          <input type="number" value={newPoint.Sequence_number} onChange={e => setNewPoint({ ...newPoint, Sequence_number: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Giờ đến dự kiến:</label>
          <input type="datetime-local" value={newPoint.Estimated_arrival} onChange={e => setNewPoint({ ...newPoint, Estimated_arrival: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Giờ đến thực tế:</label>
          <input type="datetime-local" value={newPoint.Actual_arrival} onChange={e => setNewPoint({ ...newPoint, Actual_arrival: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Trạng thái:</label>
          <input type="text" value={newPoint.Status} onChange={e => setNewPoint({ ...newPoint, Status: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary">Lưu</button>
        <button type="button" className="btn btn-secondary" onClick={resetPointForm}>Hủy</button>
      </form>
    </div>
  </div>
)}

    <div className="wh-card" style={{ marginTop: 30 }}>
      <div className="wh-card-header">
        <h3>Quản lý Kho hàng</h3>
        <button className="wh-btn wh-btn-primary" onClick={() => {
          resetWarehouseForm();
          setShowWarehouseModal(true);
        }}>Thêm Kho</button>
      </div>
      <table className="wh-table">
        <thead>
          <tr>
            <th>Tên kho</th>
            <th>Địa chỉ</th>
            <th>Thành phố</th>
            <th>Quản lý</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map(wh => (
            <tr key={wh.WarehouseID}>
              <td>{wh.Name}</td>
              <td>{`${wh.Street || ''}, ${wh.Ward || ''}, ${wh.District || ''}`}</td>
              <td>{wh.City}</td>
              <td>{wh.ManagerName || 'Chưa phân công'}</td>
              <td>
                <button className="wh-btn wh-btn-warning wh-btn-sm" onClick={() => handleEditWarehouse(wh)}>Sửa</button>
                <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => handleDeleteWarehouse(wh.WarehouseID)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

   {showWarehouseModal && (
  <div className="modal">
    <div className="modal-content">
      <form onSubmit={(e) => { e.preventDefault(); handleAddWarehouse(); }}>
        <h4>{editWarehouseId ? 'Cập nhật Kho hàng' : 'Thêm Kho hàng'}</h4>

        <div className="form-group">
          <label>Tên kho:</label>
          <input type="text" value={newWarehouse.Name} onChange={e => setNewWarehouse({ ...newWarehouse, Name: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Đường:</label>
          <input type="text" value={newWarehouse.Street} onChange={e => setNewWarehouse({ ...newWarehouse, Street: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Phường:</label>
          <input type="text" value={newWarehouse.Ward} onChange={e => setNewWarehouse({ ...newWarehouse, Ward: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Quận:</label>
          <input type="text" value={newWarehouse.District} onChange={e => setNewWarehouse({ ...newWarehouse, District: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Thành phố:</label>
          <input type="text" value={newWarehouse.City} onChange={e => setNewWarehouse({ ...newWarehouse, City: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Mã người quản lý (StaffID):</label>
          <input type="text" value={newWarehouse.Manager_id} onChange={e => setNewWarehouse({ ...newWarehouse, Manager_id: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary">Lưu</button>
        <button type="button" className="btn btn-secondary" onClick={resetWarehouseForm}>Hủy</button>
      </form>
    </div>
  </div>
)}

  </div> 
);
};

export default Warehouse_Setup;
