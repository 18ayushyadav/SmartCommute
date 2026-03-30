import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import RoutePlanner from './components/RoutePlanner';
import CarpoolSection from './components/CarpoolCard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('smartcommute_theme');
    return saved === 'dark';
  });
  const [activeSection, setActiveSection] = useState('planner');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('smartcommute_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="app">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="app-main">
        {/* Hero Stats */}
        <div className="container">
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Daily Commuters</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Routes Optimized</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2.5T</div>
              <div className="hero-stat-label">CO₂ Saved</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">4.9★</div>
              <div className="hero-stat-label">User Rating</div>
            </div>
          </div>
        </div>

        <RoutePlanner />

        <div className="section-divider"><hr /></div>

        <CarpoolSection />

        <div className="section-divider"><hr /></div>

        <AnalyticsDashboard />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">SmartCommute</div>
          <div className="footer-text">
            Making daily commutes smarter, cheaper, and greener 🌿
          </div>
          <div className="footer-links">
            <span className="footer-link">About</span>
            <span className="footer-link">Privacy</span>
            <span className="footer-link">Terms</span>
            <span className="footer-link">Contact</span>
          </div>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;
