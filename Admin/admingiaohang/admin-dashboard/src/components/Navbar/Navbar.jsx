import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

const handleLogout = () => {
  sessionStorage.clear();
  navigate('/login');
  window.location.reload();
};


  return (
    <div className="navbar">
      <div className="navbar-title">Quản lý giao hàng</div>

      <div className="navbar-admin" style={{ position: 'relative' }}>
        <button className="admin-button" onClick={() => setShowMenu(!showMenu)}>
          Admin
        </button>

        {showMenu && (
          <div className="admin-dropdown">
            <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
