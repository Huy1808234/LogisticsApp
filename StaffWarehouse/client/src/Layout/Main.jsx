import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';

const Main = () => {
    const [order_code, setOrder_code] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập fetch dữ liệu
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

    const handleTrack = (e) => {
        e.preventDefault();
        if (order_code.trim() === '') {
            alert("Vui lòng nhập mã đơn hàng");
            setSubmitted(false);
        } else {
            setSubmitted(true);
        }
    };
    if (loading) return <Loading />;

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

                                <form onSubmit={handleTrack} className="search-box">
                                    <div className="input-form">
                                        <input
                                            type="text"
                                            placeholder="Your Tracking ID"
                                            value={order_code}
                                            onChange={(e) => setOrder_code(e.target.value)}
                                        />
                                    </div>
                                    <div className="search-form">
                                        <Link
                                            to={`/orderDetail/${order_code}`}
                                            onClick={(e) => {
                                                if (order_code.trim() === '') {
                                                    e.preventDefault();
                                                    alert("Vui lòng nhập mã đơn hàng");
                                                }
                                            }}
                                        >
                                            Track & Trace
                                        </Link>

                                    </div>
                                </form>

                                <div className="hero-pera">
                                    <p>For order status inquiry</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
