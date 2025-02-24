import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ProfileSystem from "./ProfileSystem";
import Modal from "react-modal";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";

// Set the app element for accessibility
Modal.setAppElement("#root");

const customModalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    position: "relative",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    padding: 0,
    margin: "auto",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto",
    maxWidth: "600px",
    width: "90%",
  },
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  return (
    <>
      <header>
        <div id="theme-menu-one" className="main-header-area pl-100 pr-100 pt-20 pb-15">
          <div className="container-fluid">
            <div className="row align-items-center">
              {/* Logo Section */}
              <div className="col-xl-2 col-lg-2 col-5">
                <div className="logo">
                  <Link to="/">
                    <img src="assets/img/logo/main logoo.svg" alt="Logo" />
                  </Link>
                </div>
              </div>

              {/* Nav Links (Desktop) */}
              <div className="col-xl-7 col-lg-8 d-lg-block">
                <nav className="main-menu navbar navbar-expand-lg justify-content-center">
                  <div className="nav-container">
                    <ul className="flex justify-content-between gap-5">
                      <li className="nav-item">
                        <Link className="text-white" to="/">
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/courses">Courses</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/about">About Us</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/contact">Contact</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/faq">FAQ</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/blog">Blog</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {/* Right Section (Login / MyCourses, User Icon, Mobile Toggler) */}
              <div className="col-xl-3 col-lg-2 col-7">
                <div className="right-nav d-flex align-items-center justify-content-end">
                  <div className="right-btn mr-25 mr-xs-15">
                    <ul className="d-flex align-items-center">
                      <li>
                        {isLoggedIn ? (
                          <Link to="/courses" className="theme_btn free_btn">
                            My Courses
                          </Link>
                        ) : (
                          <button
                            onClick={() => setShowLoginModal(true)}
                            className="theme_btn free_btn"
                          >
                            Login
                          </button>
                        )}
                      </li>
                      {/* User Icon - toggles user menu */}
                      <li className="sign-in ml-20" style={{ position: "relative" }}>
                        <script src="https://cdn.lordicon.com/lordicon.js"></script>
                        <div onClick={toggleUserMenu} style={{ cursor: "pointer" }}>
                          <lord-icon
                            src="https://cdn.lordicon.com/fmasbomy.json"
                            trigger="click"
                            state="hover-looking-around"
                            colors="primary:#121331,secondary:#c6c6c4,tertiary:#b16901"
                            style={{ width: "45px", height: "45px" }}
                          />
                        </div>
                        {isLoggedIn && showUserMenu && (
                          <div
                            className="user-dropdown-menu"
                            style={{
                              position: "absolute",
                              top: "50px",
                              right: 0,
                              background: "#fff",
                              color: "#000",
                              border: "1px solid #ccc",
                              borderRadius: "5px",
                              padding: "0.5rem 1rem",
                              zIndex: 9999,
                            }}
                          >
                            <button
                              onClick={() => {
                                setShowProfileModal(true);
                                setShowUserMenu(false);
                              }}
                              style={{
                                border: "none",
                                background: "none",
                                padding: "0",
                                margin: "0",
                                fontSize: "1rem",
                                cursor: "pointer",
                                display: "block",
                                marginBottom: "0.5rem",
                              }}
                            >
                            Profile
                            </button>
                            <button
                              onClick={handleLogout}
                              style={{
                                border: "none",
                                background: "none",
                                padding: "0",
                                margin: "0",
                                fontSize: "1rem",
                                cursor: "pointer",
                                display: "block",
                              }}
                            >
                              Logout
                            </button>
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>

                  {/* Hamburger visible on small screens */}
                  <div className="hamburger-menu d-md-inline-block d-lg-none text-right">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                      <i className="far fa-bars"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full relative mt-100 overflow-y-auto">
            {/* <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
            >
              <X size={20} />
            </button> */}
            <ProfileSystem onClose={() => setShowProfileModal(false)}  />
          </div>
        </div>
      )}

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onRequestClose={() => setShowLoginModal(false)}
        style={customModalStyles}
        contentLabel="Login Modal"
      >
        <div className="relative">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-300 bg-transparent border-none"
            style={{ cursor: "pointer" }}
          >
            <X size={20} />
          </button>
          <Login
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
          />
        </div>
      </Modal>

      {/* Register Modal */}
      <Modal
        isOpen={showRegisterModal}
        onRequestClose={() => setShowRegisterModal(false)}
        style={customModalStyles}
        contentLabel="Register Modal"
      >
        <div className="relative">
          <button
            onClick={() => setShowRegisterModal(false)}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-300 bg-transparent border-none"
            style={{ cursor: "pointer" }}
          >
            <X size={20} />
          </button>
          <Register />
        </div>
      </Modal>
    </>
  );
}

export default Navbar;
