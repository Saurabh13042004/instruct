import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, User, LogOut } from "lucide-react";
import ProfileSystem from "./ProfileSystem";
import Modal from "react-modal";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";

// Set the app element for accessibility
Modal.setAppElement("#root");

const navItemStyles = {
  link: {
    color: "white",
    transition: "color 0.3s ease",
  },
  linkHover: {
    color: "#EB9F18",
  }
};

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
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
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
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "#121212", // Adjust background color as needed
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: Add a shadow for better visibility
      }}
      >
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
                        <Link
                          className="text-white"
                          to="/"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => e.target.style.color = "#EB9F18"}
                          onMouseLeave={(e) => e.target.style.color = "white"}
                        >
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/courses"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => e.target.style.color = "#EB9F18"}
                          onMouseLeave={(e) => e.target.style.color = "white"}
                        >
                          Courses
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/about"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => e.target.style.color = "#EB9F18"}
                          onMouseLeave={(e) => e.target.style.color = "white"}
                        >
                          About Us
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/contact"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => e.target.style.color = "#EB9F18"}
                          onMouseLeave={(e) => e.target.style.color = "white"}
                        >
                          Contact
                        </Link>
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
                          <Link to="/courses" className="theme_btn wow  ">
                            My Courses
                          </Link>
                        ) : (
                          <button
                            onClick={() => setShowLoginModal(true)}
                            className="theme_btn wow  ">

                            Login
                          </button>
                        )}
                      </li>
                    </ul>
                  </div>

                  {/* User Icon - toggles user menu */}
                  {isLoggedIn && (
                    <div className="user-icon mr-15 relative" ref={dropdownRef}>
                      <button
                        onClick={toggleUserMenu}
                        className={`
                        w-10 h-10 rounded-full
                        bg-white/10
                        flex items-center justify-center
                        transition-transform duration-300
                        ${showUserMenu ? 'scale-95' : 'scale-100'}
                      `}
                      >
                        <span className="text-xl">👤</span>
                      </button>

                      <div className={`
                        absolute right-0 mt-3
                        transition-all duration-300
                        origin-top-right
                        ${showUserMenu
                          ? 'scale-100 opacity-100 translate-y-0'
                          : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
                        }
                      `}>
                        {/* Card Container */}
                        <div className="
                          relative w-44 rounded-2xl
                          before:absolute before:inset-0
                          before:rounded-2xl before:bg-gray-900/40
                          before:backdrop-blur-sm
                          before:shadow-[0_8px_16px_rgb(0_0_0/0.4)]
                          after:absolute after:inset-0
                          after:rounded-2xl after:-z-10
                          after:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]
                          after:bg-gradient-to-b after:from-white/10 after:to-transparent
                        ">
                          {/* Menu Items */}
                          <div className="relative py-1">
                            <button
                              className={`
                                w-full flex items-center gap-3 px-4 py-3
                                text-white text-sm font-medium
                                transition-all duration-300
                                ${showUserMenu ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                              `}
                              style={{ transitionDelay: '200ms' }}
                              onClick={() => {
                                setShowProfileModal(true);
                                setShowUserMenu(false);
                              }}
                            >
                              <User size={16} />
                              <span>Profile</span>
                            </button>

                            <button
                              className={`
                                w-full flex items-center gap-3 px-4 py-3
                                text-red-400 text-sm font-medium
                                transition-all duration-300
                                ${showUserMenu ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                              `}
                              style={{ transitionDelay: '300ms' }}
                              onClick={handleLogout}
                            >
                              <LogOut size={16} />
                              <span>Log out</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  )}

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
            className="absolute top-1 right-36 z-50 text-gray-400 hover:text-gray-300 hover:border-none bg-transparent border-none"
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
