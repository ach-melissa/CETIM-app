import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "./LogoCetim.png";
import "./Header.css";

function Header() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

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

  return (
    <>
      {/* Hamburger button */}
      <div className={`header-menu-btn ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
        
      </div>

      {/* Overlay to close menu when clicking outside */}
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
              <span>Paramètre Entreprise</span>
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
        </ul>
      </nav>
    </>
  );
}

export default Header;