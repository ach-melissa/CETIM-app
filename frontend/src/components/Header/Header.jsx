import React, { useState, useEffect } from "react"; 
import { NavLink, useNavigate } from "react-router-dom";
import logo from "./LogoCetim.png";
import "./Header.css";

function Header() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if it's the user's first visit to the page
    const visited = localStorage.getItem("hasVisited");
    if (visited) {
      setIsFirstVisit(false);
      setIsOpen(false);
    } else {
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Clear any user session data
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Redirect to login page (root "/")
    navigate("/");

    // Close the menu if not first visit
    if (!isFirstVisit) {
      toggleMenu();
    }
  };

  return (
    <>
      {/* Hamburger button */}
      <div
        className={`header-menu-btn ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      ></div>

      {/* Overlay */}
      {isOpen && <div className="header-overlay" onClick={toggleMenu}></div>}

      {/* Sidebar */}
      <nav className={`header-sidebar ${isOpen ? "open" : ""}`}>
        <div className="header-logo-container">
          <img src={logo} alt="Cetim Logo" className="header-logo" />
        </div>
        <ul className="header-nav-list">
          <li className="header-nav-item">
            <NavLink 
              to="/parnorm" 
              end 
              className={({ isActive }) => `header-nav-link ${isActive ? "active" : ""}`}
              onClick={() => !isFirstVisit && toggleMenu()}
            >
              <span>Paramètre Norm</span>
            </NavLink>
          </li>
          <li className="header-nav-item">
            <NavLink 
              to="/parentreprise" 
              className={({ isActive }) => `header-nav-link ${isActive ? "active" : ""}`}
              onClick={() => !isFirstVisit && toggleMenu()}
            >
              <span>Paramètre Clients</span>
            </NavLink>
          </li>
          <li className="header-nav-item">
            <NavLink 
              to="/traitdonnes" 
              className={({ isActive }) => `header-nav-link ${isActive ? "active" : ""}`}
              onClick={() => !isFirstVisit && toggleMenu()}
            >
              <span>Traitement Données</span>
            </NavLink>
          </li>
          <li className="header-nav-item">
            <NavLink 
              to="/historique" 
              className={({ isActive }) => `header-nav-link ${isActive ? "active" : ""}`}
              onClick={() => !isFirstVisit && toggleMenu()}
            >
              <span>Historique</span>
            </NavLink>
          </li>

          {/* Quitter */}
          <li className="header-nav-item header-nav-item-quitter">
            <button 
              className="header-nav-link header-nav-link-quitter"
              onClick={handleLogout}
            >
              <span>Quitter</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Header;
