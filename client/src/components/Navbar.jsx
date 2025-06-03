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
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // state to track mobile view
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    setUserType(userType);
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check window width to determine mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  // Inline styles for the mobile drawer (vertical menu)
  const mobileDrawerStyles = {
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "75%",
      maxWidth: "300px",
      backgroundColor: "#121212",
      zIndex: 1500,
      padding: "20px",
      transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s ease-in-out",
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "none",
      border: "none",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
    },
    menuList: {
      listStyle: "none",
      padding: 0,
      marginTop: "60px",
    },
    menuItem: {
      marginBottom: "20px",
      fontSize: "18px",
    },
    link: {
      color: "white",
      textDecoration: "none",
    },
  };

  // Define modal content styles based on device size
  const contentStyles = {
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
    width: "95%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflow: "visible", // Let the child handle scrolling
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
      padding: "10px",
      overflow: "hidden", // Prevent overlay scrolling
    },
    content: contentStyles,
  };

  // Add this useEffect to prevent background scrolling when modal is open
  useEffect(() => {
    if (showLoginModal || showRegisterModal || showProfileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showLoginModal, showRegisterModal, showProfileModal]);

  return (
    <>
      <header
        className="w-full"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#121212",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div id="theme-menu-one" className="main-header-area pl-100 pr-100 pt-20 pb-15">
          <div className="container-fluid">
            <div className="row align-items-center">
              {/* Logo */}
              <div className="col-xl-2 col-lg-2 col-5">
                <div className="logo">
                  <Link to="/">
                    <img
                      src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
                      alt="Logo"
                      style={{ maxWidth: "100%" }}
                    />
                  </Link>
                </div>
              </div>

              {/* Desktop Nav Links (shown on medium and larger screens) */}
              <div className="col-xl-7 col-lg-8 d-none d-md-block">
                <nav className="main-menu navbar navbar-expand-lg justify-content-center">
                  <div className="nav-container">
                    <ul className="flex justify-content-between gap-5">
                      <li className="nav-item">
                        <Link
                          className="text-white"
                          to={
                            userType === "admin"
                              ? "/admin"
                              : "/"
                          }
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => (e.target.style.color = "#EB9F18")}
                          onMouseLeave={(e) => (e.target.style.color = "white")}
                        >
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/courses"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => (e.target.style.color = "#EB9F18")}
                          onMouseLeave={(e) => (e.target.style.color = "white")}
                        >
                          Courses
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/about"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => (e.target.style.color = "#EB9F18")}
                          onMouseLeave={(e) => (e.target.style.color = "white")}
                        >
                          About Us
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          to="/contact"
                          onClick={() => setMenuOpen(false)}
                          style={navItemStyles.link}
                          onMouseEnter={(e) => (e.target.style.color = "#EB9F18")}
                          onMouseLeave={(e) => (e.target.style.color = "white")}
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {/* Right Section: Login/My Courses, User Icon, and Hamburger */}
              <div className="col-xl-3 col-lg-2 col-7">
                <div className="right-nav d-flex align-items-center justify-content-end">
                  {/* Desktop Login / My Courses */}
                  <div className="right-btn mr-25 mr-xs-15 d-none d-md-block">
                    <ul className="d-flex align-items-center">
                      <li>
                        {isLoggedIn ? (
                          <Link to="/courses" className="theme_btn">
                            My Courses
                          </Link>
                        ) : (
                          <button onClick={() => setShowLoginModal(true)} className="theme_btn">
                            Login
                          </button>
                        )}
                      </li>
                    </ul>
                  </div>

                  {/* User Icon for logged-in users */}
                  {isLoggedIn && (
                    <div className="user-icon mr-15 relative" ref={dropdownRef}>
                      <div
                        onClick={toggleUserMenu}
                        className={`w-15 cursor-pointer h-15 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${
                          showUserMenu ? "scale-95" : "scale-100"
                        }`}
                      >
                        <User size={24} />
                      </div>
                      <div
                        className={`absolute right-0 mt-3 transition-all duration-300 origin-top-right ${
                          showUserMenu
                            ? "scale-100 opacity-100 translate-y-0"
                            : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                      >
                        <div className="relative w-44 rounded-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-gray-900/40 before:backdrop-blur-sm before:shadow-[0_8px_16px_rgb(0_0_0/0.4)] after:absolute after:inset-0 after:rounded-2xl after:-z-10 after:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] after:bg-gradient-to-b after:from-white/10 after:to-transparent">
                          <div className="relative py-1">
                            <div
                              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-white text-sm font-medium transition-all duration-300 ${
                                showUserMenu ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                              }`}
                              style={{ transitionDelay: "200ms" }}
                              onClick={() => {
                                setShowProfileModal(true);
                                setShowUserMenu(false);
                              }}
                            >
                              <User size={16} />
                              <span>Profile</span>
                            </div>
                            <div
                              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-red-400 text-sm font-medium transition-all duration-300 ${
                                showUserMenu ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                              }`}
                              style={{ transitionDelay: "300ms" }}
                              onClick={handleLogout}
                            >
                              <LogOut size={16} />
                              <span>Log out</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hamburger Menu (visible on mobile/tablet screens) */}
                  <div className="hamburger-menu d-md-none">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle" aria-label="Toggle menu">
                      {menuOpen ? <X size={24} /> : <i className="far fa-bars"></i>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Drawer for menu items */}
      <div style={mobileDrawerStyles.container}>
        <button onClick={() => setMenuOpen(false)} style={mobileDrawerStyles.closeButton}>
          <X size={24} />
        </button>
        <ul style={mobileDrawerStyles.menuList}>
          <li style={mobileDrawerStyles.menuItem}>
            <Link to="/" style={mobileDrawerStyles.link} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li style={mobileDrawerStyles.menuItem}>
            <Link to="/courses" style={mobileDrawerStyles.link} onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
          </li>
          <li style={mobileDrawerStyles.menuItem}>
            <Link to="/about" style={mobileDrawerStyles.link} onClick={() => setMenuOpen(false)}>
              About Us
            </Link>
          </li>
          <li style={mobileDrawerStyles.menuItem}>
            <Link to="/contact" style={mobileDrawerStyles.link} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li style={mobileDrawerStyles.menuItem}>
            {isLoggedIn ? (
              <Link to="/courses" style={mobileDrawerStyles.link} onClick={() => setMenuOpen(false)}>
                My Courses
              </Link>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setMenuOpen(false);
                }}
                style={{ ...mobileDrawerStyles.link, background: "none", border: "none" }}
              >
                Login
              </button>
            )}
          </li>
        </ul>
      </div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onRequestClose={() => setShowLoginModal(false)}
        style={customModalStyles}
        contentLabel="Login Modal"
      >
        <div className="relative max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl">
          <button
            onClick={() => setShowLoginModal(false)}
            className="sticky top-4 right-4 z-50 float-right text-gray-400 hover:text-gray-300 bg-transparent border-none"
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
