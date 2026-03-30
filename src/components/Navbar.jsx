import { useState } from 'react';
import { FiSun, FiMoon, FiMenu, FiX, FiMap, FiUsers, FiBarChart2, FiNavigation } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar({ darkMode, setDarkMode, activeSection, setActiveSection }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'planner', label: 'Route Planner', icon: <FiNavigation /> },
    { id: 'carpool', label: 'Carpools', icon: <FiUsers /> },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  ];

  const handleNav = (id) => {
    setActiveSection(id);
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <FiMap />
          </div>
          <div>
            <div className="navbar-title">SmartCommute</div>
            <div className="navbar-tagline">Smart Daily Commute Planner</div>
          </div>
        </div>

        <div className={`navbar-nav${mobileOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link${activeSection === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
              id={`nav-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            id="theme-toggle"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
