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
    backdropFilter: "blur(5px)",
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
                    <img src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg" alt="Logo" />
                  </Link>
                </div>
              </div>

              {/* Nav Links (Desktop) */}
              <div className={`col-xl-7 col-lg-8 ${menuOpen ? 'mobile-menu-active' : 'd-none d-lg-block'}`}>
                <nav className="main-menu navbar navbar-expand-lg justify-content-center">
                  <div className={`nav-container ${menuOpen ? 'mobile-nav' : ''}`}>
                    <ul className="flex justify-content-between gap-5">
                      <li className="nav-item">
                        <Link className="text-white" to="/" onClick={() => setMenuOpen(false)}>
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

          {/* Right Section (Login / MyCourses, User Icon, Mobile Toggler) */}
          <div className="col-xl-3 col-lg-2 col-7">
                <div className="right-nav d-flex align-items-center justify-content-end">
                  <div className="right-btn mr-25 mr-xs-15 d-none d-lg-block">
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
                    </ul>
                  </div>
                  {/* User Icon - toggles user menu */}
                  <div className="user-icon mr-15">
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
                        </div>
                  {/* Hamburger Menu */}
                  <div className="hamburger-menu d-lg-none">
                    <button 
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="menu-toggle"
                      aria-label="Toggle menu"
                    >
                      {menuOpen ? (
                        <X size={24} />
                      ) : (
                        <i className="far fa-bars"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="mobile-menu-overlay d-lg-none">
            <div className="mobile-menu-container">
              <nav className="mobile-nav">
                <ul className="mobile-menu-items">
                  <li>
                    {isLoggedIn ? (
                      <Link to="/courses" className="theme_btn free_btn" onClick={() => setMenuOpen(false)}>
                        My Courses
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setMenuOpen(false);
                        }}
                        className="theme_btn free_btn"
                      >
                        Login
                      </button>
                    )}
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>



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


      {/* Profile Modal */}
      <Modal
  isOpen={showProfileModal}
  onRequestClose={() => setShowProfileModal(false)}
  style={customModalStyles}
  contentLabel="Profile Modal"
>
  <ProfileSystem onClose={() => setShowProfileModal(false)} />
</Modal>
    </>
  );
}

export default Navbar;
