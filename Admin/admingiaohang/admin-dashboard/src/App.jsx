import React, { useEffect, useState } from 'react';
import Sidebar from './components/Slidebar/Sidebar';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import User_Management from './pages/User-Management/User_Management';
import Order_Management from './pages/Order-Management/Order_Management';
import Payment_Management from './pages/Payment-Management/Payment_Management';
import Warehouse_Setup from './pages/Warehouse-Setup/Warehouse_Setup';
import Navbar from './components/Navbar/Navbar';
import Service from './pages/Service/Service';
import Transactions from './pages/Transactions/Transactions';
import Vehicle from './pages/Vehicle/Vehicle';
import Tracking from './pages/Tracking/Tracking';
import Package from './pages/Package/Package';
import Account from './pages/Account/Account';
import LoginPage from './components/Login/LoginPage';
import RevenueReport from './pages/Transactions/RevenueReport';
const AppLayout = () => (
  <>
    <Navbar />
    <div className="flex min-h-screen">
      {/* Sidebar chiếm cố định chiều ngang */}
      <div className="w-56 bg-slate-800 text-white">
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <main className="flex-1 bg-gray-100 p-6">
        <Routes>
          <Route path="/User_Management" element={<User_Management />} />
          <Route path="/Transactions/Revenue_Report" element={<RevenueReport />} />
          <Route path="/Order_Management" element={<Order_Management />} />
          <Route path="/Service" element={<Service />} />
          <Route path="/Payment_Management" element={<Payment_Management />} />
          <Route path="/Warehouse_Setup" element={<Warehouse_Setup />} />
          <Route path="/Vehicle" element={<Vehicle />} />
          <Route path="/Tracking" element={<Tracking />} />
          <Route path="/Package" element={<Package />} />
          <Route path="/Transactions" element={<Transactions />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/" element={<Navigate to="/User_Management" />} />
        </Routes>
      </main>
    </div>
  </>
);

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        await axios.get('http://localhost:3000/api/accounts/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAuthenticated(true);
      } catch (err) {
        sessionStorage.clear();
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);
  if (isAuthenticated === null) {
    return <div>Đang xác minh đăng nhập...</div>;
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

export default App;
