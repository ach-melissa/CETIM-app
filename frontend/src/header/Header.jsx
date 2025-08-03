import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import logoCetim from './logo-cetim.png';

function Header() {
  const handleLogout = () => {
    // Clear session or token
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login page
    window.location.href = '/'; 
  };

  return (
    <header className={styles.mainHeader}>
      <div className={styles.headerContainer}>
        <img src={logoCetim} alt="Logo Cetim" className={styles.logo} />

        <nav className={styles.nav}>

          <NavLink
            to="/parnorm"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <span>Norm</span>
          </NavLink>

          
          <NavLink
            to="/parentreprise"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <span>Entreprise</span>
          </NavLink>

          <NavLink
            to="/traitdonnes"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <span>Données</span>
          </NavLink>

          <NavLink
            to="/historique"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <span>Historique</span>
          </NavLink>

          <button onClick={handleLogout} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span>Quitter</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;


