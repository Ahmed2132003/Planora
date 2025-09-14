import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import Login from './Login';
import VerifyEmail from './VerifyEmail';
import ResetPassword from './ResetPassword';
import PlanoraCalendar from './Calendar';
import AdminPanel from './AdminPanel';
import Reports from './Reports';
import Archive from './Archive';
import Chat from './Chat';
import Settings from './Settings';
import { motion } from 'framer-motion';

function App() {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setLanguage(savedLang);
    } else {
      i18n.changeLanguage('ar');
      localStorage.setItem('language', 'ar');
    }
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <Router>
      <div className="app-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <style>
          {`
            .app-container {
              min-height: 100vh;
              background-color: #F9FAFB;
              color: #1F2937;
              font-family: 'Amiri', Arial, sans-serif;
              transition: background-color 0.3s ease, color 0.3s ease;
            }

            nav {
              background-color: #3A86FF;
              color: #FFFFFF;
              padding: 16px;
              animation: fadeIn 0.5s ease-in;
            }

            .nav-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              max-width: 1200px;
              margin: 0 auto;
            }

            .nav-logo {
              height: 40px;
              margin-right: ${language === 'ar' ? '0' : '16px'};
              margin-left: ${language === 'ar' ? '16px' : '0'};
            }

            ul {
              display: flex;
              list-style: none;
              padding: 0;
              margin: 0;
              gap: 16px;
            }

            a {
              color: #FFFFFF;
              text-decoration: none;
              font-size: 16px;
              transition: color 0.3s ease, transform 0.2s ease;
            }

            a:hover {
              color: #E5E7EB;
              transform: scale(1.05);
            }

            .language-icon {
              background-color: #FFFFFF;
              color: #3A86FF;
              padding: 8px 12px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              transition: background-color 0.3s ease, transform 0.2s ease;
            }

            .language-icon:hover {
              background-color: #E5E7EB;
              transform: scale(1.1);
            }

            .username {
              color: #FFFFFF;
              font-size: 16px;
              font-weight: bold;
              margin-right: ${language === 'ar' ? '16px' : '0'};
              margin-left: ${language === 'ar' ? '0' : '16px'};
            }

            .login-language-container {
              display: flex;
              justify-content: ${language === 'ar' ? 'flex-start' : 'flex-end'};
              padding: 16px;
            }

            .login-language-icon {
              background-color: #3A86FF;
              color: #FFFFFF;
              padding: 8px 12px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              transition: background-color 0.3s ease, transform 0.2s ease;
            }

            .login-language-icon:hover {
              background-color: #2563EB;
              transform: scale(1.1);
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        {isLoggedIn ? (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="nav-content">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src="https://i.postimg.cc/x8YPfM2K/planora-removebg-preview.png"
                  alt="Planora Logo"
                  className="nav-logo"
                />
                <ul>
                  <li><Link to="/calendar">{t('calendar')}</Link></li>
                  <li><Link to="/reports">{t('reports')}</Link></li>
                  <li><Link to="/archive">{t('archive')}</Link></li>
                  <li><Link to="/settings">{t('settings')}</Link></li>
                  {user?.role === 'Admin' && (
                    <li><Link to="/admin">{t('admin_panel')}</Link></li>
                  )}
                </ul>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="username">{user?.username}</span>
                <button
                  className="language-icon"
                  onClick={toggleLanguage}
                  title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                  {language === 'ar' ? 'EN' : 'AR'}
                </button>
              </div>
            </div>
          </motion.nav>
        ) : (
          <div className="login-language-container">
            <button
              className="login-language-icon"
              onClick={toggleLanguage}
              title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to={user.role === 'Admin' ? '/admin' : '/calendar'} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/calendar"
            element={isLoggedIn ? <PlanoraCalendar user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/reports"
            element={isLoggedIn ? <Reports user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/archive"
            element={isLoggedIn ? <Archive user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/chat"
            element={isLoggedIn ? <Chat user={user} projectId="1" /> : <Navigate to="/" />}
          />
          <Route
            path="/settings"
            element={isLoggedIn ? <Settings user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={
              isLoggedIn && user.role === 'Admin' ? <AdminPanel /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;