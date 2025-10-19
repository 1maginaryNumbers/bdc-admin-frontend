import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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
  FiShoppingBag,
  FiPlus,
  FiCheckCircle,
  FiSend,
  FiBarChart,
  FiClock,
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';

const Dashboard = () => {
  const { refreshTrigger } = useRefresh();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    umat: 0,
    kegiatan: 0,
    pengumuman: 0,
    galeri: 0,
    pendaftaran: 0,
    sumbangan: 0,
    saran: 0,
    merchandise: 0,
    pendingPendaftaran: 0,
    upcomingKegiatan: 0,
    monthlySumbangan: 0,
    totalAbsensi: 0
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
        merchandiseRes,
        absensiRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/umat'),
        axios.get('http://localhost:5000/api/kegiatan'),
        axios.get('http://localhost:5000/api/pengumuman'),
        axios.get('http://localhost:5000/api/galeri'),
        axios.get('http://localhost:5000/api/pendaftaran'),
        axios.get('http://localhost:5000/api/sumbangan'),
        axios.get('http://localhost:5000/api/saran'),
        axios.get('http://localhost:5000/api/merchandise'),
        axios.get('http://localhost:5000/api/absensi')
      ]);

      const umatData = Array.isArray(umatRes.data) ? umatRes.data : umatRes.data.umat || [];
      const kegiatanData = Array.isArray(kegiatanRes.data) ? kegiatanRes.data : kegiatanRes.data.kegiatan || [];
      const pengumumanData = Array.isArray(pengumumanRes.data) ? pengumumanRes.data : pengumumanRes.data.pengumuman || [];
      const galeriData = Array.isArray(galeriRes.data) ? galeriRes.data : galeriRes.data.galeri || [];
      const pendaftaranData = Array.isArray(pendaftaranRes.data) ? pendaftaranRes.data : pendaftaranRes.data.pendaftaran || [];
      const sumbanganData = Array.isArray(sumbanganRes.data) ? sumbanganRes.data : sumbanganRes.data.sumbangan || [];
      const saranData = Array.isArray(saranRes.data) ? saranRes.data : saranRes.data.saran || [];
      const merchandiseData = Array.isArray(merchandiseRes.data) ? merchandiseRes.data : merchandiseRes.data.merchandise || [];
      const absensiData = Array.isArray(absensiRes.data) ? absensiRes.data : absensiRes.data.absensi || [];

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const pendingPendaftaran = pendaftaranData.filter(p => p.status === 'pending').length;
      const upcomingKegiatan = kegiatanData.filter(k => {
        const kegiatanDate = new Date(k.tanggal);
        return kegiatanDate >= now && kegiatanDate <= sevenDaysFromNow;
      }).length;

      const monthlySumbangan = sumbanganData
        .filter(s => {
          const sumbanganDate = new Date(s.tanggal);
          return sumbanganDate.getMonth() === currentMonth && sumbanganDate.getFullYear() === currentYear;
        })
        .reduce((total, s) => total + (s.jumlah || 0), 0);

      setStats({
        umat: umatData.length,
        kegiatan: kegiatanData.length,
        pengumuman: pengumumanData.length,
        galeri: galeriData.length,
        pendaftaran: pendaftaranData.length,
        sumbangan: sumbanganData.length,
        saran: saranData.length,
        merchandise: merchandiseData.length,
        pendingPendaftaran,
        upcomingKegiatan,
        monthlySumbangan,
        totalAbsensi: absensiData.length
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Activity',
      description: 'Create a new kegiatan',
      icon: FiPlus,
      color: '#e74c3c',
      action: () => navigate('/kegiatan')
    },
    {
      title: 'Process Registrations',
      description: `${stats.pendingPendaftaran} pending`,
      icon: FiCheckCircle,
      color: '#1abc9c',
      action: () => navigate('/pendaftaran')
    },
    {
      title: 'Send Announcement',
      description: 'Broadcast to all members',
      icon: FiSend,
      color: '#f39c12',
      action: () => navigate('/pengumuman')
    },
    {
      title: 'Generate Report',
      description: 'Export attendance data',
      icon: FiBarChart,
      color: '#9b59b6',
      action: () => navigate('/absensi')
    }
  ];

  const statCards = [
    { 
      key: 'umat', 
      label: 'Total Members', 
      icon: FiUsers, 
      color: '#3498db',
      value: stats.umat,
      subtitle: 'Registered umat'
    },
    { 
      key: 'upcomingKegiatan', 
      label: 'Upcoming Activities', 
      icon: FiClock, 
      color: '#e74c3c',
      value: stats.upcomingKegiatan,
      subtitle: 'Next 7 days'
    },
    { 
      key: 'monthlySumbangan', 
      label: 'Monthly Donations', 
      icon: FiTrendingUp, 
      color: '#27ae60',
      value: `Rp ${stats.monthlySumbangan.toLocaleString('id-ID')}`,
      subtitle: 'This month'
    },
    { 
      key: 'pendingPendaftaran', 
      label: 'Pending Approvals', 
      icon: FiAlertCircle, 
      color: '#f39c12',
      value: stats.pendingPendaftaran,
      subtitle: 'Need review'
    }
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    {card.value}
                  </h3>
                  <p style={{
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0 0 4px 0'
                  }}>
                    {card.label}
                  </p>
                  <p style={{
                    color: '#999',
                    fontSize: '12px',
                    margin: 0
                  }}>
                    {card.subtitle}
                  </p>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{
                    fontSize: '28px',
                    color: card.color
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              className="content-card"
              style={{
                borderLeft: `4px solid ${action.color}`,
                transition: 'all 0.2s',
                cursor: 'pointer',
                padding: '20px'
              }}
              onClick={action.action}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: `${action.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{
                    fontSize: '24px',
                    color: action.color
                  }} />
                </div>
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                {action.title}
              </h4>
              <p style={{
                color: '#666',
                fontSize: '14px',
                margin: 0
              }}>
                {action.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="content-card">
        <ActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
