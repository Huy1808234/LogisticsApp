import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [Username, setUsername] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/accounts/login', {
      Username,
      Password,
    });

    console.log('Đăng nhập thành công:', res.data);
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('role', res.data.role);
    sessionStorage.setItem('username', res.data.username);
    navigate('/');
    window.location.reload();
  } catch (err) {
    console.error('Lỗi:', err);
    setError('Đăng nhập thất bại. Bạn không phải là Admin');
  }
};

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      <input
        type="text"
        placeholder="Username"
        value={Username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={Password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Đăng nhập</button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default LoginPage;
