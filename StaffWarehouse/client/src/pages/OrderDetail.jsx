import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Send,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getOrderDetail } from "../Services/OrderService";
import { Link, useParams } from "react-router-dom";
import { formatMoney } from "../utils/Money";
import { formatDate } from "../utils/Date";
import VehicleModal from "../Component/VehicleModal";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [IsLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { order_code } = useParams();

  //Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (order_code) {
      console.log("Bắt đầu fetch với order_code:", order_code);
      fetchDetail();
    } else {
      console.error("Không có order_code trong URL params");
      setError("Mã đơn hàng không hợp lệ");
    }
  }, [order_code]);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Gọi getOrderDetail với:", order_code);
      const data = await getOrderDetail(order_code);
      console.log("Dữ liệu nhận được:", data);

      if (data) {
        setOrder(data);
      } else {
        setError("Không tìm thấy dữ liệu đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi trong fetchDetail:", err);
      setError(err.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hiển thị modal gán xe
  const handleShowVehicle = (order, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(order);
    setShowVehicleModal(true);
  };

  // Xử lý đóng modal
  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setSelectedOrder(null);
  };

  // Xử lý gán xe
  const handleAssignVehicle = async () => {
    alert("Gửi đon hàng thành công!!!");
    fetchDetail();
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Mới tạo":
        return;
      case "Đang vận chuyển":
        return;
      case "sorting":
        return "Đang phân loại";
      case "in_transit":
        return "Đang vận chuyển";
      case "arrived_destination":
        return "Đã đến kho đích";
      case "out_for_delivery":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      default:
        return;
    }
  };

  // Loading state
  if (IsLoading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="progress-table">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error-container">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchDetail}>Thử lại</button>
        </div>
      </div>
    );
  }

  // No order data
  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="no-data-container">
          <Package size={48} />
          <p>Không tìm thấy thông tin đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      {/* Header */}
      <div className="order-detail-header">
        <div className="order-detail-header__container">
          <div className="order-detail-header__content">
            <div className="order-detail-header__title-group">
              <div className="order-detail-header__icon">
                <Link to={"/"}>
                  <img src={"/assets/img/logo/logo.png"} />
                </Link>
              </div>
              <div>
                <h1 className="order-detail-header__title">
                  Chi tiết đơn hàng
                </h1>
                <p className="order-detail-header__subtitle">
                  {order.code || "N/A"}
                </p>
              </div>
            </div>
            {order.status === "Mới tạo" && (
              <button
                className="order-detail-send-button"
                onClick={(e) => handleShowVehicle(order, e)}
              >
                <Send size={18} />
                <span>Gửi đơn</span>
                <div className={"order-detail-send-button__glow"}></div>
              </button>
            )}
            <div
              className={`order-detail-status order-detail-status--${
                order.status || "unknown"
              }`}
            >
              <CheckCircle size={16} />
              {order.status}
              {getStatusText(order.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="order-detail-main">
        <div className="order-detail-grid">
          {/* Main Content */}
          <div>
            {/* Order Overview */}
            <div className="order-detail-card">
              <div className="order-detail-card__header">
                <h2 className="order-detail-card__title">
                  <Package size={20} />
                  Tổng quan đơn hàng
                </h2>
              </div>
              <div className="order-detail-card__body">
                <div className="order-detail-overview">
                  <div className="order-detail-overview__item order-detail-overview__item--blue">
                    <div className="order-detail-overview__icon">
                      <Clock />
                    </div>
                    <p className="order-detail-overview__label">Ngày tạo</p>
                    <p className="order-detail-overview__value">
                      {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                    </p>
                  </div>
                  <div className="order-detail-overview__item order-detail-overview__item--green">
                    <div className="order-detail-overview__icon">
                      <Truck />
                    </div>
                    <p className="order-detail-overview__label">Dự kiến giao</p>
                    <p className="order-detail-overview__value">
                      {order.estimatedDelivery
                        ? formatDate(order.estimatedDelivery)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="order-detail-overview__item order-detail-overview__item--purple">
                    <div className="order-detail-overview__icon">
                      <Package />
                    </div>
                    <p className="order-detail-overview__label">Khối lượng</p>
                    <p className="order-detail-overview__value">
                      {order.weight || 0} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="order-detail-card">
              <div className="order-detail-card__header">
                <h2 className="order-detail-card__title">
                  <Truck size={20} />
                  Lịch trình vận chuyển
                </h2>
              </div>
              <div className="order-detail-card__body">
                <div className="order-detail-timeline">
                  {/* Kiểm tra order.tracking tồn tại và là array trước khi map */}
                  {order.tracking &&
                  Array.isArray(order.tracking) &&
                  order.tracking.length > 0 ? (
                    order.tracking.map((step) => (
                      <div
                        key={step.id}
                        className="order-detail-timeline__item"
                      >
                        <div
                          className={`order-detail-timeline__marker ${
                            step.completed
                              ? step.current
                                ? "order-detail-timeline__marker--current"
                                : "order-detail-timeline__marker--completed"
                              : "order-detail-timeline__marker--pending"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div
                          className={`order-detail-timeline__content ${
                            step.completed
                              ? step.current
                                ? "order-detail-timeline__content--current"
                                : "order-detail-timeline__content--completed"
                              : ""
                          }`}
                        >
                          <div className="order-detail-timeline__header">
                            <h4 className="order-detail-timeline__title">
                              {step.title || "N/A"}
                            </h4>
                            <span className="order-detail-timeline__time">
                              {step.timestamp
                                ? formatDate(step.timestamp)
                                : "N/A"}
                            </span>
                          </div>
                          <p className="order-detail-timeline__description">
                            {step.description || "Không có mô tả"}
                          </p>
                          <p className="order-detail-timeline__location">
                            <MapPin size={12} />
                            {step.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Chưa có thông tin lịch trình vận chuyển</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="order-detail-card">
              <div className="order-detail-card__header">
                <h2 className="order-detail-card__title">
                  <MapPin size={20} />
                  Thông tin địa chỉ
                </h2>
              </div>
              <div className="order-detail-card__body">
                <div className="order-detail-addresses">
                  <div className="order-detail-address order-detail-address--sender">
                    <div className="order-detail-address__header">
                      <User size={16} />
                      Người gửi
                    </div>
                    <div className="order-detail-address__info">
                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          Tên:
                        </span>
                        <span className="order-detail-address__value">
                          {order.sender?.name || "N/A"}
                        </span>
                      </div>
                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          SĐT:
                        </span>
                        <span className="order-detail-address__value">
                          {order.sender?.phone || "N/A"}
                        </span>
                      </div>
                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          Địa chỉ:
                        </span>
                        <span className="order-detail-address__value">
                          {order.sender?.address || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="order-detail-address order-detail-address--receiver">
                    <div className="order-detail-address__header">
                      <MapPin size={16} />
                      Người nhận
                    </div>
                    <div className="order-detail-address__info">
                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          Tên:
                        </span>
                        <span className="order-detail-address__value">
                          {order.receiver?.name || "N/A"}
                        </span>
                      </div>
                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          SĐT:
                        </span>
                        <span className="order-detail-address__value">
                          {order.receiver?.phone || "N/A"}
                        </span>
                      </div>

                      <div className="order-detail-address__row">
                        <span className="order-detail-address__label">
                          Địa chỉ:
                        </span>
                        <span className="order-detail-address__value">
                          {order.receiver?.address || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="order-detail-sidebar">
            {/* Package Information */}
            <div className="order-detail-card">
              <div className="order-detail-card__header">
                <h3 className="order-detail-card__title">
                  <Package size={18} />
                  Thông tin hàng hóa
                </h3>
              </div>
              <div className="order-detail-card__body">
                <div className="order-detail-info-list">
                  <div className="order-detail-info-row">
                    <span className="order-detail-info-label">Mô tả:</span>
                    <span className="order-detail-info-value">
                      {order.package?.description || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-info-row">
                    <span className="order-detail-info-label">Số lượng:</span>
                    <span className="order-detail-info-value">
                      {order.package?.quantity || 0} kiện
                    </span>
                  </div>
                  <div className="order-detail-info-row">
                    <span className="order-detail-info-label">Giá trị:</span>
                    <span className="order-detail-info-value">
                      {order.package?.value
                        ? formatMoney(order.package.value)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-info-row">
                    <span className="order-detail-info-label">Kích thước:</span>
                    <span className="order-detail-info-value">
                      {order.dimensions || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-info-row">
                    <span className="order-detail-info-label">Khối lượng:</span>
                    <span className="order-detail-info-value">
                      {order.weight || 0} kg
                    </span>
                  </div>
                </div>
                <div className="order-detail-notes">
                  <p className="order-detail-notes__title">Ghi chú:</p>
                  <p className="order-detail-notes__content">
                    {order.package?.notes || "Không có ghi chú"}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            {order.driver && (
              <div className="order-detail-card">
                <div className="order-detail-card__header">
                  <h3 className="order-detail-card__title">
                    <Truck size={18} />
                    Thông tin tài xế
                  </h3>
                </div>
                <div className="order-detail-card__body">
                  <div className="order-detail-info-list">
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">
                        Tên tài xế:
                      </span>
                      <span className="order-detail-info-value">
                        {order.driver.driver_name || "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">SĐT:</span>
                      <span className="order-detail-info-value">
                        {order.driver.driver_phone || "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">Biển số:</span>
                      <span className="order-detail-info-value">
                        {order.driver.vehicle || "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">Loại xe:</span>
                      <span className="order-detail-info-value">
                        {order.driver.vehicleType || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Shipper Information */}
            {order.shipper && (
              <div className="order-detail-card">
                <div className="order-detail-card__header">
                  <h3 className="order-detail-card__title">
                    <Truck size={18} />
                    Thông tin Shipper
                  </h3>
                </div>
                <div className="order-detail-card__body">
                  <div className="order-detail-info-list">
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">
                        Tên tài xế:
                      </span>
                      <span className="order-detail-info-value">
                        {order.shipper.shipper_name || "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">SĐT:</span>
                      <span className="order-detail-info-value">
                        {order.shipper.shipper_phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Fee Breakdown */}
            {order.fees && (
              <div className="order-detail-card">
                <div className="order-detail-card__header">
                  <h3 className="order-detail-card__title">
                    <FileText size={18} />
                    Chi phí vận chuyển
                  </h3>
                </div>
                <div className="order-detail-card__body">
                  <div className="order-detail-info-list">
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">
                        Phí vận chuyển:
                      </span>
                      <span className="order-detail-info-value">
                        {order.fees.shippingFee
                          ? formatMoney(order.fees.shippingFee)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">Phí COD:</span>
                      <span className="order-detail-info-value">
                        {order.fees.codFee
                          ? formatMoney(order.fees.codFee)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-row">
                      <span className="order-detail-info-label">
                        Phí bảo hiểm:
                      </span>
                      <span className="order-detail-info-value">
                        {order.fees.insuranceFee
                          ? formatMoney(order.fees.insuranceFee)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="order-detail-fees">
                    <div className="order-detail-info-row order-detail-fees__total">
                      <span className="order-detail-info-label">
                        Tổng cộng:
                      </span>
                      <span className="order-detail-info-value">
                        {order.fees.total
                          ? formatMoney(order.fees.total)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/*/!* COD Information *!/*/}
            {/*{order.codAmount && (*/}
            {/*    <div className="order-detail-cod">*/}
            {/*        <h4 className="order-detail-cod__title">💰 Thu hộ COD</h4>*/}
            {/*        <p className="order-detail-cod__amount">{formatMoney(order.codAmount)}</p>*/}
            {/*        <p className="order-detail-cod__note">Cần thu khi giao hàng</p>*/}
            {/*    </div>*/}
            {/*)}*/}
          </div>
        </div>
      </div>

      <VehicleModal
        isOpen={showVehicleModal}
        onClose={handleCloseVehicleModal}
        orderData={selectedOrder}
        onAssignVehicle={handleAssignVehicle}
      />
    </div>
  );
};

export default OrderDetail;
