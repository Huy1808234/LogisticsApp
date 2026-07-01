import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import {BrowserRouter, Route, Routes} from "react-router-dom";
import { ScrollToTop } from "./Layout";
import {
    Home, 
    OrdersList,
    OrderDetail,
    VehicleList,
    VehicleOrders,
    Login
} from './pages'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <ScrollToTop>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/orders" element={<OrdersList/>} />
                <Route path="/orderDetail/:order_code" element={<OrderDetail/>} />
                <Route path="/vehicles" element={<VehicleList/>} />
                <Route path="/vehicle/:vehicle_id" element={<VehicleOrders/>} />
                <Route path="/login" element={<Login/>} />
            </Routes>
        </ScrollToTop>
    </BrowserRouter>
);


reportWebVitals();
