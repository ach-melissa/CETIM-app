import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "./LogoCetim.png";
import "./Header.css";

function Header() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load permissions and role from localStorage
    const perms = JSON.parse(localStorage.getItem("permissions") || "{}");
    const userRole = localStorage.getItem("role") || "";
    setPermissions(perms);
    setRole(userRole);

    // Menu behavior
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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    navigate("/");

    if (!isFirstVisit) toggleMenu();
  };

  const canSee = (permName) => role === "admin" || permissions[permName] === 1 || permissions[permName] === true;

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
          {canSee("parnorm") && (
            <li className="header-nav-item">
              <NavLink
                to="/parnorm"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Paramètre Norm</span>
              </NavLink>
            </li>
          )}

          {canSee("parametre_ciment") && (
            <li className="header-nav-item">
              <NavLink
                to="/ParametreCiment"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Paramètre Ciment</span>
              </NavLink>
            </li>
          )}

          {canSee("parametre_clients") && (
            <li className="header-nav-item">
              <NavLink
                to="/parentreprise"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Paramètre Clients</span>
              </NavLink>
            </li>
          )}

          {canSee("traitement_donnees") && (
            <li className="header-nav-item">
              <NavLink
                to="/traitdonnes"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Traitement Données</span>
              </NavLink>
            </li>
          )}

          {canSee("historique") && (
            <li className="header-nav-item">
              <NavLink
                to="/historique"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Historique</span>
              </NavLink>
            </li>
          )}

          {role === "admin" && (
            <li className="header-nav-item">
              <NavLink
                to="/paramutilisateurs"
                end
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => !isFirstVisit && toggleMenu()}
              >
                <span>Paramètre Utilisateurs</span>
              </NavLink>
            </li>
          )}

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
