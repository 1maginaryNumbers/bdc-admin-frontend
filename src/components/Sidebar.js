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
  FiMessageSquare,
  FiShoppingBag,
  FiLayers,
  FiInfo,
  FiCheckSquare,
  FiCamera,
  FiSettings,
  FiLogOut,
  FiRefreshCw,
  FiActivity,
  FiMenu,
  FiX,
  FiHeart,
  FiMail,
  FiPackage
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
    { path: '/', label: 'Dashboard', icon: FiHome, color: '#3498db' },
    { path: '/umat', label: 'Umat', icon: FiUsers, color: '#9b59b6' },
    { path: '/kegiatan', label: 'Kegiatan', icon: FiActivity, color: '#e67e22' },
    { path: '/jadwal', label: 'Calendar', icon: FiCalendar, color: '#e74c3c' },
    { path: '/pengumuman', label: 'Pengumuman', icon: FiBell, color: '#f39c12' },
    { path: '/broadcast-email', label: 'Broadcast Email', icon: FiMail, color: '#009688' },
    { path: '/galeri', label: 'Galeri', icon: FiImage, color: '#1abc9c' },
    { path: '/pendaftaran', label: 'Pendaftaran', icon: FiClipboard, color: '#16a085' },
    { path: '/sumbangan', label: 'Sumbangan', icon: FiHeart, color: '#e91e63' },
    { path: '/paket-sumbangan', label: 'Paket Sumbangan', icon: FiPackage, color: '#c2185b' },
    { path: '/saran', label: 'Kritik & Saran', icon: FiMessageSquare, color: '#00bcd4' },
    { path: '/merchandise', label: 'Merchandise', icon: FiShoppingBag, color: '#ff9800' },
    { path: '/struktur', label: 'Struktur Organisasi', icon: FiLayers, color: '#673ab7' },
    { path: '/info-umum', label: 'Info Umum', icon: FiInfo, color: '#2196f3' },
    { path: '/absensi', label: 'Absensi', icon: FiCheckSquare, color: '#4caf50' },
    { path: '/scan', label: 'Scan QR', icon: FiCamera, color: '#795548' },
    { path: '/activitylog', label: 'Activity Log', icon: FiActivity, color: '#607d8b' },
    { path: '/admin', label: 'Admin', icon: FiSettings, color: '#9e9e9e' }
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
          overflow: 'hidden',
          transition: 'left 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #34495e',
        flexShrink: 0
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>BDC Admin</h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
      }}>
        <nav style={{ padding: '20px 0', flex: 1, overflowY: 'auto', minHeight: 0 }}>
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
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(52, 73, 94, 0.5)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? item.color : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 8px ${item.color}40` : 'none'
                }}>
                  <Icon style={{ 
                    fontSize: '18px',
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.9)'
                  }} />
                </div>
                <span style={{
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px'
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '20px',
          flexShrink: 0,
          borderTop: '1px solid #34495e',
          background: '#2c3e50'
        }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRefresh();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
            onTouchStart={(e) => e.target.style.backgroundColor = '#2980b9'}
            onTouchEnd={(e) => {
              e.target.style.backgroundColor = '#3498db';
              handleRefresh();
            }}
          >
            <FiRefreshCw style={{ marginRight: '8px' }} />
            Refresh
          </button>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
          onTouchStart={(e) => e.target.style.backgroundColor = '#c0392b'}
          onTouchEnd={(e) => {
            e.target.style.backgroundColor = '#e74c3c';
            logout();
          }}
        >
          <FiLogOut style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
