import React, { useState } from "react";
import axios from "axios";

const SliderArea: React.FC = () => {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const res = await axios.get(
        `http://localhost:3001/api/orders/track/${trackingId}`
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi không xác định");
    }
  };

  // Styles
  const resultBoxStyle: React.CSSProperties = {
    background: "#fff",
    color: "#111",
    padding: "30px",
    borderRadius: "14px",
    marginTop: "30px",
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "1.7",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  };

  const headingStyle: React.CSSProperties = {
    color: "#f5b400",
    fontWeight: 800,
    fontSize: "22px",
    textTransform: "uppercase",
  };

  const subHeadingStyle: React.CSSProperties = {
    color: "#d97706",
    fontWeight: 700,
    fontSize: "18px",
    marginTop: "20px",
  };

  const listStyle: React.CSSProperties = {
    paddingLeft: "25px",
    marginTop: "10px",
    color: "#000",
    fontSize: "16px",
  };

  const labelStyle = (value: string, type: "status" | "payment") => ({
    color:
      type === "payment"
        ? value === "Đã thanh toán"
          ? "green"
          : "red"
        : value === "Đã huỷ"
        ? "red"
        : "#111",
    fontWeight: 700,
  });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      hour12: false,
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="slider-area">
      <div className="slider-active">
        <div className="single-slider slider-height d-flex align-items-center">
          <div className="container">
            <div className="row">
              <div className="col-xl-9 col-lg-9">
                <div className="hero__caption">
                  <h1>
                    Safe & Reliable <span>Logistic</span> Solutions!
                  </h1>
                </div>

                <form className="search-box" onSubmit={handleTrack}>
                  <div className="input-form">
                    <input
                      type="text"
                      placeholder="Your Tracking ID"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                  <div className="search-form">
                    <button
                      type="submit"
                      className="btn btn-warning text-white"
                    >
                      Track & Trace
                    </button>
                  </div>
                </form>

                <div className="hero-pera">
                  <p>For order status inquiry</p>
                </div>

                {error && <p className="text-danger mt-3">{error}</p>}

                {result && (
                  <div style={resultBoxStyle}>
                    <h4 style={headingStyle}>Mã đơn: {result.orderCode}</h4>
                    <p>
                      Trạng thái:{" "}
                      <span style={labelStyle(result.status, "status")}>
                        {result.status}
                      </span>
                    </p>
                    <p>
                      Thanh toán:{" "}
                      <span style={labelStyle(result.payment, "payment")}>
                        {result.payment}
                      </span>
                    </p>
                    <p>
                      Người gửi: {result.sender.name} - {result.sender.phone}
                    </p>
                    <p>
                      Người nhận: {result.receiver.name} -{" "}
                      {result.receiver.phone}
                    </p>
                    <p>Địa chỉ: {result.receiver.address}</p>
                    <p>Mô tả hàng: {result.description}</p>
                    <p>Trị giá: {Number(result.value).toLocaleString()} VND</p>
                    <p>
                      Khối lượng: {result.weight}kg - Kích thước:{" "}
                      {result.dimensions}
                    </p>
                    <h5 style={subHeadingStyle}>Lịch sử xử lý:</h5>
                    <ul style={listStyle}>
                      {result.tracking.map((item: any, index: number) => (
                        <li key={index}>
                          [{formatTime(item.time)}] - {item.status} tại{" "}
                          {item.location}
                          {item.notes && ` (${item.notes})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderArea;
