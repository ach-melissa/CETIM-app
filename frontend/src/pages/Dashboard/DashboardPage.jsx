// src/pages/Dashboard/DashboardPage.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./DashboardPage.module.css";
import logoCetim from "./logo-cetim.png";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Header with horizontal navigation - Always visible */}
      <header className={styles.dashboardHeader}>
        <div className={styles.logoContainer}>
          <img src={logoCetim} alt="Logo CETIM" className={styles.logo} />
        </div>
        
        <nav className={styles.horizontalNav}>
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Accueil
          </NavLink>
          <NavLink 
            to="/dashboard/parnorm" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Norm
          </NavLink>
          <NavLink 
            to="/dashboard/parentreprise" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Entreprise
          </NavLink>
          <NavLink 
            to="/dashboard/traitdonnes" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Données
          </NavLink>
          <NavLink 
            to="/dashboard/historique" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Historique
          </NavLink>
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Quitter
        </button>
      </header>

      {/* Main Content - Takes full width below navigation */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
