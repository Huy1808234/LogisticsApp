import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";//	Gửi request HTTP đến backend để lấy dữ liệu đơn hàng.
import { Bar } from "react-chartjs-2";//Vẽ biểu đồ cột (bar chart) thể hiện số lượng đơn hàng theo trạng thái.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";//Xuất dữ liệu đơn hàng ra file Excel.
import { saveAs } from "file-saver";//luu file 
import { Link } from "react-router-dom";//Điều hướng khi bấm vào mã đơn hàng (<Link> đến
import Layout from "../layouts/Layout";

// Đăng ký các thành phần biểu đồ cần thiết từ Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Định nghĩa các trạng thái đơn hàng có sẵn
const ORDER_STATUSES = [
  "Mới tạo",
  "Đang giao",
  "Hoàn thành",
  "Thất bại",
  "Đã huỷ",
];

const Profile: React.FC = () => {
  // State để lưu trữ danh sách đơn hàng
  const [orders, setOrders] = useState<any[]>([]);
  // State để kiểm soát trạng thái lọc (vd: "Tất cả", "Mới tạo",...)
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  // State để lưu trữ chuỗi tìm kiếm của người dùng
  const [searchQuery, setSearchQuery] = useState("");
  // State cho trang hiện tại của phân trang
  const [currentPage, setCurrentPage] = useState(1);
  // Số lượng mục hiển thị trên mỗi trang
  const itemsPerPage = 5;
  // State để hiển thị trạng thái tải dữ liệu
  const [loading, setLoading] = useState(false);

  // useEffect để tải dữ liệu đơn hàng khi component được mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Bắt đầu tải, đặt loading là true
      try {
        const res = await axios.get("http://localhost:3001/api/orders/history");
        setOrders(res.data); // Cập nhật state orders với dữ liệu nhận được
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err); // Ghi log lỗi nếu có
      }
      setLoading(false); // Kết thúc tải, đặt loading là false
    };
    fetchOrders(); // Gọi hàm tải đơn hàng
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi mount

  // useMemo để tính toán danh sách đơn hàng đã được lọc và tìm kiếm
  const displayedOrders = useMemo(() => {
    let result = orders; // Bắt đầu với tất cả đơn hàng

    // Áp dụng bộ lọc trạng thái nếu không phải là "Tất cả"
    if (filterStatus !== "Tất cả") {
      result = result.filter(
        (o) =>
          o.Order_status?.trim().toLowerCase() ===
          filterStatus.trim().toLowerCase()
      );
    }

    // Áp dụng tìm kiếm nếu có searchQuery
    if (searchQuery) {
      result = result.filter(
        (o) =>
          o.Order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result; // Trả về danh sách đơn hàng đã được lọc và tìm kiếm
  }, [orders, filterStatus, searchQuery]); // Phụ thuộc vào orders, filterStatus, và searchQuery

  // useEffect để đặt lại trang hiện tại về 1 mỗi khi bộ lọc hoặc tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  // Tính toán tổng số trang dựa trên displayedOrders
  const totalPages = Math.ceil(displayedOrders.length / itemsPerPage);

  // useMemo để lấy danh sách đơn hàng cho trang hiện tại (đã phân trang)
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage; // Vị trí bắt đầu của các mục trên trang
    return displayedOrders.slice(start, start + itemsPerPage); // Cắt mảng để lấy các mục của trang hiện tại
  }, [displayedOrders, currentPage]); // Phụ thuộc vào displayedOrders và currentPage

  // useMemo để tính toán số lượng đơn hàng theo từng trạng thái cho biểu đồ
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ORDER_STATUSES.forEach((status) => (counts[status] = 0)); // Khởi tạo tất cả số lượng là 0
    orders.forEach((order) => {
      const cleanStatus = order.Order_status?.trim(); // Lấy trạng thái và loại bỏ khoảng trắng
      if (counts.hasOwnProperty(cleanStatus)) {
        counts[cleanStatus]++; // Tăng số lượng cho trạng thái tương ứng
      }
    });
    return counts; // Trả về đối tượng chứa số lượng từng trạng thái
  }, [orders]); // Phụ thuộc vào orders (tính toán dựa trên tất cả đơn hàng, không phải đơn hàng đã lọc/tìm kiếm)

  // Dữ liệu cho biểu đồ cột
  const chartData = {
    labels: ORDER_STATUSES, // Nhãn trục X là các trạng thái đơn hàng
    datasets: [
      {
        label: "Số lượng đơn", // Nhãn cho cột dữ liệu
        data: ORDER_STATUSES.map((status) => statusCounts[status]), // Dữ liệu số lượng tương ứng
        backgroundColor: "#f59e0b", // Màu nền của cột
      },
    ],
  };

  // Tùy chọn cấu hình cho biểu đồ
  const chartOptions = {
    responsive: true, // Biểu đồ sẽ tự động điều chỉnh kích thước
    maintainAspectRatio: false, // Không duy trì tỷ lệ khung hình cố định
    animation: { duration: 0 }, // Tắt hoạt ảnh khi biểu đồ được cập nhật
    layout: { padding: { top: 10, bottom: 10 } }, // Đệm xung quanh biểu đồ
    plugins: {
      legend: { display: true, position: "top" as const }, // Hiển thị chú giải ở trên cùng
      tooltip: { enabled: true }, // Bật tooltip khi di chuột
    },
    scales: {
      y: {
        beginAtZero: true, // Trục Y bắt đầu từ 0
        ticks: { stepSize: 1, precision: 0 }, // Các vạch chia trên trục Y là số nguyên
      },
    },
  };

  // Hàm trả về class CSS cho huy hiệu trạng thái
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("hoàn")) return "badge bg-success"; // Hoàn thành -> màu xanh lá
    if (s.includes("giao")) return "badge bg-info"; // Đang giao -> màu xanh dương nhạt
    if (s.includes("mới")) return "badge bg-warning text-dark"; // Mới tạo -> màu vàng
    if (s.includes("huỷ") || s.includes("thất")) return "badge bg-danger"; // Hủy/Thất bại -> màu đỏ
    return "badge bg-secondary"; // Mặc định -> màu xám
  };

  // Hàm xuất dữ liệu ra file Excel
  const exportToExcel = () => {
    // Tạo worksheet từ dữ liệu displayedOrders (đơn hàng đang hiển thị)
    const ws = XLSX.utils.json_to_sheet(displayedOrders);
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");
    // Chuyển workbook thành dạng blob
    const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    // Lưu file Excel
    saveAs(new Blob([blob]), "donhang.xlsx");
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Trang cá nhân</h2>
          <p className="text-muted">Tổng quan và lịch sử đơn hàng</p>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow p-3" style={{ height: 300 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-warning text-white mb-3 shadow">
              <div className="card-body text-center">
                <h5 className="card-title">Tổng số đơn</h5>
                <p className="card-text fs-3 fw-bold">{orders.length}</p>
              </div>
            </div>
            <div className="card shadow p-3 mb-3">
              <label className="form-label">Lọc theo trạng thái:</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Tất cả">Tất cả</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-success" onClick={exportToExcel}>
              Xuất Excel
            </button>
          </div>
        </div>

        <hr className="my-5" />
        <h4 className="mb-3">Lịch sử đơn hàng</h4>

        <input
          className="form-control mb-3"
          placeholder="🔍 Tìm theo mã đơn hoặc người nhận..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="text-center py-5">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Người nhận</th>
                    <th>Trạng thái</th>
                    <th>Phí ship</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-3">
                        Không tìm thấy đơn hàng nào.
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, index) => (
                      <tr key={index}>
                        <td className="fw-semibold text-dark">
                          <Link
                            to={`/orders/${order.Order_code}`}
                            style={{ color: "#000", textDecoration: "none" }}
                          >
                            {order.Order_code}
                          </Link>
                        </td>
                        <td>
                          {order.receiverName} ({order.receiverPhone})
                        </td>
                        <td>
                          <span className={getStatusBadge(order.Order_status)}>
                            {order.Order_status}
                          </span>
                        </td>
                        <td>
                          {parseFloat(order.Ship_cost).toLocaleString()} VND
                        </td>
                        <td>
                          {new Date(order.Created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="mb-0">
                Trang {currentOrders.length > 0 ? currentPage : 0} /{" "}
                {totalPages}
              </p>
              <div>
                <button
                  className="btn btn-outline-primary me-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Trước
                </button>
                <button
                  className="btn btn-outline-primary"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Tiếp →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
