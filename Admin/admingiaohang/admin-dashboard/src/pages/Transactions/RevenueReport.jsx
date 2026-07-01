import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import './RevenueReport.css';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const RevenueReport = () => {
  const [summary, setSummary] = useState({});
  const [byDay, setByDay] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byMethod, setByMethod] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, dayRes, monthRes, methodRes] = await Promise.all([
          axios.get('/api/transactions/revenue/summary'),
          axios.get('/api/transactions/revenue/by-day'),
          axios.get('/api/transactions/revenue/by-month'),
          axios.get('/api/transactions/revenue/by-method'),
        ]);

        setSummary(summaryRes.data);
        setByDay(Array.isArray(dayRes.data) ? dayRes.data : []);
        setByMonth(Array.isArray(monthRes.data) ? monthRes.data : []);

        if (Array.isArray(methodRes.data)) {
          const fixed = methodRes.data.map(item => ({
            ...item,
            TotalRevenue: parseFloat(item.TotalRevenue),
          }));
          setByMethod(fixed);
        } else if (typeof methodRes.data === 'object' && methodRes.data !== null) {
          const transformed = Object.entries(methodRes.data).map(([method, revenue]) => ({
            Payment_method: method,
            TotalRevenue: parseFloat(revenue),
          }));
          setByMethod(transformed);
        } else {
          setByMethod([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="pa-card">Đang tải dữ liệu...</div>;

  return (
    <div className="pa-card">
      <div className="pa-card-header text-center">
        <h3> Báo cáo doanh thu</h3>
      </div>

      <div className="pa-summary-container">
        <SummaryCard title="Tổng đơn hàng" value={summary.totalOrders} color="pa-badge-warning" />
        <SummaryCard title="Tổng doanh thu" value={formatCurrency(summary.totalRevenue)} color="pa-badge-success" />
        <SummaryCard title="Tài xế" value={summary.totalDrivers} color="pa-badge-secondary" />
        <SummaryCard title="Khách hàng" value={summary.totalCustomers} color="pa-badge-danger" />
      </div>

      <ChartSection title=" Doanh thu theo ngày">
        {byDay.length > 0 ? (
          <ResponsiveContainer width="99%" height={300}>
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="RevenueDate"
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
              />
              <YAxis width={90} />
              <Tooltip formatter={formatCurrency} />
              <Bar dataKey="TotalRevenue" fill="#34D399" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        ) : <NoData />}
      </ChartSection>

      <ChartSection title=" Doanh thu theo tháng">
        {byMonth.length > 0 ? (
          <ResponsiveContainer width="99%" height={300}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Month" />
              <YAxis width={90} />
              <Tooltip formatter={formatCurrency} />
              <Line type="monotone" dataKey="TotalRevenue" stroke="#6366F1" name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        ) : <NoData />}
      </ChartSection>

      <ChartSection title=" Doanh thu theo phương thức thanh toán">
        {byMethod.length > 0 && byMethod.some(m => m.TotalRevenue > 0) ? (
          <ResponsiveContainer width="99%" height={300}>
            <PieChart>
              <Pie
                data={byMethod}
                dataKey="TotalRevenue"
                nameKey="Payment_method"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {byMethod.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
            </PieChart>
          </ResponsiveContainer>
        ) : <NoData />}
      </ChartSection>
    </div>
  );
};

// ==== Component phụ ====

const SummaryCard = ({ title, value, color }) => (
  <div className="pa-card pa-summary-card text-center">
    <div className={`pa-badge ${color}`} style={{ marginBottom: 8 }}>{title}</div>
    <h3>{value || 0}</h3>
  </div>
);

const ChartSection = ({ title, children }) => (
  <div className="pa-card">
    <h4 style={{ marginBottom: '1rem' }}>{title}</h4>
    {children}
  </div>
);

const NoData = () => <p className="text-center text-red-500">Không có dữ liệu</p>;

const formatCurrency = (amount) =>
  amount ? parseFloat(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 đ';

export default RevenueReport;
