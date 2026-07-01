import React, { useState, useEffect } from "react";
import {
  X,
  User,
  CheckCircle,
  AlertCircle,
  Truck,
  Table,
  Scale,
} from "lucide-react";
import { createShipment } from "../Services/OrderService";
import { getVehicleByOrder } from "../Services/VehicleService";
import { formatWeight } from "../utils/Weight";
import { useParams } from "react-router-dom";

const VehicleModal = ({ isOpen, onClose, orderData, onAssignVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { order_code } = useParams();

  useEffect(() => {
    if (isOpen && order_code) {
      fetchVehicle();
    }
  }, [isOpen, order_code]);

  const fetchVehicle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching vehicles for order code:", order_code);
      const data = await getVehicleByOrder(order_code);
      console.log("Vehicle data received:", data);
      setVehicles(data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách xe:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleAssign = async () => {
    if (!selectedVehicle) {
      alert("Vui lòng chọn xe");
      return;
    }
    setIsSubmitting(true);
    try {
      // create new shipment and update new status
      await createShipment(orderData.code, selectedVehicle.VehicleID);
      // Call parent callback
      onAssignVehicle(orderData.OrderID, selectedVehicle.VehicleID);
      // Close modal
      handleClose();
    } catch (err) {
      setError("Không thể gán đơn hàng cho shipper");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle(null);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };
  if (!isOpen || !orderData) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content shipper-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header border-bottom">
          <div>
            <h4 className="modal-title mb-1">Chọn xe</h4>
            <p className="text-muted mb-0">
              Mã đơn: <strong>{orderData?.code}</strong>
            </p>
          </div>
          <button className="btn-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Order Info */}
        <div className="order-info bg-light p-3 border-bottom">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Khách hàng:</strong> {orderData?.receiver.name}
              </p>
              <p>
                <strong>Điểm đi:</strong> {orderData?.startWarehouse}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Điểm đến:</strong> {orderData?.endWarehouse}
              </p>
              <p>
                <strong>Trọng lượng:</strong> {orderData?.weight}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3">
              <AlertCircle size={20} className="me-2" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border mb-3"></div>
              <p>Đang tải danh sách xe...</p>
            </div>
          ) : (
            <div className="shippers-list">
              <h6 className="mb-3">Chọn xe phù hợp:</h6>
              <div className="row">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.VehicleID} className="col-md-6 mb-3">
                    <div
                      className={`shipper-card border rounded p-3 cursor-pointer
                                            ${
                                              selectedVehicle?.VehicleID ===
                                              vehicle.VehicleID
                                                ? "selected border-primary bg-light"
                                                : ""
                                            } `}
                      onClick={() => handleSelectVehicle(vehicle)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <User size={20} className="me-2 text-primary" />
                          <strong>{vehicle.driverName}</strong>
                        </div>
                      </div>

                      <div className="shipper-details small text-muted">
                        <p className="mb-1">
                          <Truck size={14} className="me-1" />
                          {vehicle.Vehicle_type}
                        </p>

                        <p className="mb-1">
                          <Table size={14} className="me-1" />
                          {vehicle.License_plate}
                        </p>

                        <p className="mb-1">
                          <Scale size={14} className="me-1" />
                          {formatWeight(vehicle.capacity_weight)}
                        </p>
                      </div>

                      {selectedVehicle?.VehicleID === vehicle.VehicleID && (
                        <div className="selected-indicator mt-2">
                          <CheckCircle
                            size={16}
                            className="text-primary me-1"
                          />
                          <small className="text-primary">Đã chọn</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer border-top">
          <button
            className="btn btn-secondary me-2"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleAssign}
            disabled={!selectedVehicle || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2"></div>
                Đang gán...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="me-1" />
                Gán cho xe
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
