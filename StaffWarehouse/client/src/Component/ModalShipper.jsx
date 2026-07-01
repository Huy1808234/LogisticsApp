import React, { useState, useEffect } from "react";
import { X, User, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { createDelivery } from "../Services/DeliveryService";
import { getShipperByArea } from "../Services/ShipperService";

const ModalShipper = ({ isOpen, onClose, orderData, onAssignShipper }) => {
  const [shippers, setShippers] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && orderData?.OrderID) {
      console.log(" Modal mở: tải shipper cho OrderID:", orderData.OrderID);
      fetchShippers(orderData.OrderID);
    }
  }, [isOpen, orderData?.OrderID]);

  const fetchShippers = async (orderID) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getShipperByArea(orderID);
      console.log(" Kết quả API:", response);

      const rawList = response?.data;
      const list = Array.isArray(rawList) ? rawList : rawList ? [rawList] : [];

      console.log(" Danh sách shipper sau xử lý:", list);
      setShippers(list);
    } catch (err) {
      console.error(" Lỗi khi tải danh sách shipper:", err);
      setError("Không thể tải danh sách shipper.");
      setShippers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShipper = (shipper) => {
    console.log(" Đã chọn shipper:", shipper);
    setSelectedShipper(shipper);
  };

  const handleAssign = async () => {
    if (!selectedShipper) {
      alert("Vui lòng chọn shipper");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        " Đang gửi gán shipper:",
        selectedShipper.StaffID,
        "cho đơn:",
        orderData.OrderID
      );
      await createDelivery(orderData.OrderID, selectedShipper.StaffID);
      onAssignShipper(orderData.OrderID, selectedShipper.StaffID);
      handleClose();
    } catch (err) {
      console.error(" Lỗi khi gán shipper:", err);
      setError("Không thể gán đơn hàng cho shipper.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log(" Đóng modal, reset state");
    setSelectedShipper(null);
    setError(null);
    setShippers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content shipper-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header border-bottom">
          <div>
            <h4 className="modal-title mb-1">Gán shipper cho đơn hàng</h4>
            <p className="text-muted mb-0">
              Mã đơn: <strong>{orderData?.orderCode}</strong>
            </p>
          </div>
          <button className="btn-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="order-info bg-light p-3 border-bottom">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Khách hàng:</strong> {orderData?.customerName}
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

        {/* Body */}
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
              <p>Đang tải danh sách shipper...</p>
            </div>
          ) : (
            <div className="shippers-list">
              <h6 className="mb-3">Chọn shipper phù hợp:</h6>
              <div className="row">
                {shippers.length === 0 ? (
                  <div className="col-12">
                    <p className="text-muted">Không có shipper nào phù hợp.</p>
                  </div>
                ) : (
                  shippers.map((shipper) => (
                    <div key={shipper.StaffID} className="col-md-6 mb-3">
                      <div
                        className={`shipper-card border rounded p-3 cursor-pointer ${
                          selectedShipper?.StaffID === shipper.StaffID
                            ? "selected border-primary bg-light"
                            : ""
                        }`}
                        onClick={() => handleSelectShipper(shipper)}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <User size={20} className="me-2 text-primary" />
                          <strong>{shipper.Name}</strong>
                        </div>
                        <div className="shipper-details small text-muted">
                          <p className="mb-0">
                            <Phone size={14} className="me-1" />
                            {shipper.Phone}
                          </p>
                        </div>
                        {selectedShipper?.StaffID === shipper.StaffID && (
                          <div className="mt-2 d-flex align-items-center text-primary">
                            <CheckCircle size={16} className="me-1" />
                            <small>Đã chọn</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
            disabled={!selectedShipper || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2"></div>
                Đang gán...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="me-1" />
                Gán shipper
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalShipper;
