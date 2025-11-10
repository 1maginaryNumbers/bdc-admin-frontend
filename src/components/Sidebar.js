import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiBell,
  FiImage,
  FiClipboard,
  FiDollarSign,
  FiMessageSquare,
  FiShoppingBag,
  FiUsers as FiStructure,
  FiInfo,
  FiCheckSquare,
  FiCamera,
  FiSettings,
  FiLogOut,
  FiRefreshCw,
  FiActivity,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleRefresh = () => {
    triggerRefresh();
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/umat', label: 'Umat', icon: FiUsers },
    { path: '/kegiatan', label: 'Kegiatan', icon: FiCalendar },
    { path: '/jadwal', label: 'Calendar', icon: FiCalendar },
    { path: '/pengumuman', label: 'Pengumuman', icon: FiBell },
    { path: '/galeri', label: 'Galeri', icon: FiImage },
    { path: '/pendaftaran', label: 'Pendaftaran', icon: FiClipboard },
    { path: '/sumbangan', label: 'Sumbangan', icon: FiDollarSign },
    { path: '/saran', label: 'Saran', icon: FiMessageSquare },
    { path: '/merchandise', label: 'Merchandise', icon: FiShoppingBag },
    { path: '/struktur', label: 'Struktur', icon: FiStructure },
    { path: '/info-umum', label: 'Info Umum', icon: FiInfo },
    { path: '/absensi', label: 'Absensi', icon: FiCheckSquare },
    { path: '/scan', label: 'Scan QR', icon: FiCamera },
    { path: '/activitylog', label: 'Activity Log', icon: FiActivity },
    { path: '/admin', label: 'Admin', icon: FiSettings }
  ];

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {/* Mobile menu toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1001,
            background: '#2c3e50',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          className="mobile-menu-toggle"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          left: isMobile ? (isOpen ? 0 : '-250px') : 0,
          top: 0,
          width: '250px',
          height: '100vh',
          background: '#2c3e50',
          color: 'white',
          zIndex: 1000,
          overflowY: 'auto',
          transition: 'left 0.3s ease'
        }}
      >
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #34495e'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Vihara Admin</h2>
      </div>

      <nav style={{ padding: '20px 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: isActive ? '#3498db' : 'white',
                textDecoration: 'none',
                backgroundColor: isActive ? '#34495e' : 'transparent',
                borderLeft: isActive ? '3px solid #3498db' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <Icon style={{ marginRight: '12px', fontSize: '18px' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            <FiRefreshCw style={{ marginRight: '8px' }} />
            Refresh
          </button>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '12px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
        >
          <FiLogOut style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
