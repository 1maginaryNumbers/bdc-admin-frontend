import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRefresh } from '../contexts/RefreshContext';
import ActivityLog from './ActivityLog';
import {
  FiUsers,
  FiCalendar,
  FiBell,
  FiImage,
  FiClipboard,
  FiDollarSign,
  FiMessageSquare,
  FiShoppingBag
} from 'react-icons/fi';

const Dashboard = () => {
  const { refreshTrigger } = useRefresh();
  const [stats, setStats] = useState({
    umat: 0,
    kegiatan: 0,
    pengumuman: 0,
    galeri: 0,
    pendaftaran: 0,
    sumbangan: 0,
    saran: 0,
    merchandise: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const [
        umatRes,
        kegiatanRes,
        pengumumanRes,
        galeriRes,
        pendaftaranRes,
        sumbanganRes,
        saranRes,
        merchandiseRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/umat'),
        axios.get('http://localhost:5000/api/kegiatan'),
        axios.get('http://localhost:5000/api/pengumuman'),
        axios.get('http://localhost:5000/api/galeri'),
        axios.get('http://localhost:5000/api/pendaftaran'),
        axios.get('http://localhost:5000/api/sumbangan'),
        axios.get('http://localhost:5000/api/saran'),
        axios.get('http://localhost:5000/api/merchandise')
      ]);

      setStats({
        umat: umatRes.data.length,
        kegiatan: kegiatanRes.data.length,
        pengumuman: pengumumanRes.data.length,
        galeri: galeriRes.data.length,
        pendaftaran: pendaftaranRes.data.length,
        sumbangan: sumbanganRes.data.length,
        saran: saranRes.data.length,
        merchandise: merchandiseRes.data.length
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { key: 'umat', label: 'Umat', icon: FiUsers, color: '#3498db' },
    { key: 'kegiatan', label: 'Kegiatan', icon: FiCalendar, color: '#e74c3c' },
    { key: 'pengumuman', label: 'Pengumuman', icon: FiBell, color: '#f39c12' },
    { key: 'galeri', label: 'Galeri', icon: FiImage, color: '#9b59b6' },
    { key: 'pendaftaran', label: 'Pendaftaran', icon: FiClipboard, color: '#1abc9c' },
    { key: 'sumbangan', label: 'Sumbangan', icon: FiDollarSign, color: '#27ae60' },
    { key: 'saran', label: 'Saran', icon: FiMessageSquare, color: '#34495e' },
    { key: 'merchandise', label: 'Merchandise', icon: FiShoppingBag, color: '#e67e22' }
  ];

  if (loading) {
    return (
      <div className="loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of Vihara Management System</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="content-card"
              style={{
                borderLeft: `4px solid ${card.color}`,
                transition: 'transform 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    {stats[card.key]}
                  </h3>
                  <p style={{
                    color: '#666',
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {card.label}
                  </p>
                </div>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{
                    fontSize: '24px',
                    color: card.color
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Recent Activity</h3>
        <ActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
