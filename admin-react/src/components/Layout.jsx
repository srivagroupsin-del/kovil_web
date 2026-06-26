import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const location = useLocation();

  // Simple auth check simulation
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collapse sidebar when navigating to a new route on mobile devices
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`app-container ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="main-content">
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
      {!isCollapsed && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsCollapsed(true)} 
        />
      )}
    </div>
  );
};

export default Layout;
