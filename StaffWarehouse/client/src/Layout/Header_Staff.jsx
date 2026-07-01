import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header_Staff = () => {
  const isLogin = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <div>
      <div className="header-area">
        <div className="main-header">
          <div className="header-top d-none d-lg-block">
            <div className="container">
              <div className="col-xl-12">
                <div className="row d-flex justify-content-between align-items-center">
                  <div className="header-info-left"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom header-sticky">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-2 col-lg-2">
                  <div className="logo">
                    <Link to="/">
                      {" "}
                      <img src="/assets/img/logo/logo.png" alt="Logo" />
                    </Link>
                  </div>
                </div>
                <div className="col-xl-10 col-lg-10">
                  <div className="menu-wrapper d-flex align-items-center justify-content-end">
                    <div className="main-menu d-none d-lg-block">
                      <nav>
                        <ul id="navigation">
                          <li>
                            <Link to="/">Home</Link>
                          </li>
                          <li>
                            <Link to="">Xem danh sách</Link>
                            <ul className="submenu">
                              <li>
                                <Link to="/orders">Đơn hàng</Link>
                              </li>
                              <li>
                                <Link to="/vehicles">Xe vận chuyển</Link>
                              </li>
                            </ul>
                          </li>

                          <li>
                            {isLogin ? (
                              <Link to="#" onClick={handleLogout}>
                                Đăng xuất
                              </Link>
                            ) : (
                              <Link to="/login">Đăng nhập</Link>
                            )}
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
                {/* Mobile Menu */}
                <div className="col-12">
                  <div className="mobile_menu d-block d-lg-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header_Staff;
