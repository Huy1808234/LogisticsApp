import { useState } from 'react';
import {login} from '../Services/UsersService';
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.email && formData.password) {
            setIsLoading(true);
            const result = await login(formData.email, formData.password);
            if (result) {
                await new Promise(resolve => setTimeout(resolve, 100));
                navigate('/');
            }
        }
        setIsLoading(false);
    };

    const handleInputFocus = (e) => {
        const parent = e.target.closest('.form-group');
        if (parent) parent.style.transform = 'scale(1.02)';
    };

    const handleInputBlur = (e) => {
        const parent = e.target.closest('.form-group');
        if (parent) parent.style.transform = 'scale(1)';
    };

    return (
        <div className="employee-login-wrapper">

            <div className="background-grid" />

            <div className="floating-shapes">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
                <div className="shape shape-3" />
            </div>

            <div className="login-container">

                <div className="logo-section">
                    <div className="logo-box">
                        <img src={"/assets/img/logo/logo.png"}/>
                    </div>
                    <div className="brand-name">LOGISTIC EXPRESS</div>
                </div>

                <h1 className="title">Đăng Nhập Nhân Viên</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    >
                        <span>{isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}</span>
                        <div className="btn-glow"/>
                    </button>
                </form>

            </div>
        </div>
    );
}
