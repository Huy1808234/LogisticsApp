import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="footer-area footer-bg">
        <div className="container">
          <div className="footer-top footer-padding">
            <div className="footer-heading">
              <div className="row justify-content-between">
                <div className="col-xl-6 col-lg-8 col-md-8">
                  <div className="wantToWork-caption wantToWork-caption2">
                    <h2>We Understand The Importance Approaching Each Work!</h2>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4">
                  <span className="contact-number f-right">
                    + 1 212-683-9756
                  </span>
                </div>
              </div>
            </div>

            <div className="row d-flex justify-content-between">
              <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6">
                <div className="single-footer-caption mb-50">
                  <div className="footer-tittle">
                    <h4>COMPANY</h4>
                    <ul>
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li>
                        <Link to="/company">Company</Link>
                      </li>
                      <li>
                        <Link to="/blog">Press & Blog</Link>
                      </li>
                      <li>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                <div className="single-footer-caption mb-50">
                  <div className="footer-tittle">
                    <h4>Open hour</h4>
                    <ul>
                      <li>Monday 11am-7pm</li>
                      <li>Tuesday-Friday 11am-8pm</li>
                      <li>Saturday 10am-6pm</li>
                      <li>Sunday 11am-6pm</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="single-footer-caption mb-50">
                  <div className="footer-tittle">
                    <h4>RESOURCES</h4>
                    <ul>
                      <li>
                        <Link to="/home-insurance">Home Insurance</Link>
                      </li>
                      <li>
                        <Link to="/travel-insurance">Travel Insurance</Link>
                      </li>
                      <li>
                        <Link to="/car-insurance">Car Insurance</Link>
                      </li>
                      <li>
                        <Link to="/business-insurance">Business Insurance</Link>
                      </li>
                      <li>
                        <Link to="/health-insurance">Health Insurance</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-5 col-sm-6">
                <div className="single-footer-caption mb-50">
                  <div className="footer-logo">
                    <Link to="/">
                      <img
                        src="assets/img/logo/logo2_footer.png"
                        alt="Footer Logo"
                      />
                    </Link>
                  </div>
                  <div className="footer-tittle">
                    <div className="footer-pera">
                      <p className="info1">
                        The trade war currently ensuing between the US and
                        several nations around the globe, most fiercely with.
                      </p>
                    </div>
                  </div>

                  <div className="footer-social">
                    <a
                      href="https://www.facebook.com/sai4ull"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      href="https://www.example.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-globe"></i>
                    </a>
                    <a
                      href="https://www.instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="row d-flex align-items-center">
              <div className="col-lg-12">
                <div className="footer-copy-right text-center">
                  <p>
                    Copyright &copy; {currentYear} All rights reserved | This
                    template is made with{" "}
                    <i className="fa fa-heart" aria-hidden="true"></i> by{" "}
                    <a
                      href="https://colorlib.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Colorlib
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
