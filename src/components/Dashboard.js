import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../contexts/RefreshContext';
import ActivityLog from './ActivityLog';
import {
  FiUsers,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar
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
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const [
        umatRes,
        kegiatanRes,
        pengumumanRes,
        galeriRes,
        pendaftaranRes,
        sumbanganRes,
        saranRes,
        merchandiseRes,
        absensiRes,
        jadwalRes
      ] = await Promise.all([
        axios.get('https://finalbackend-ochre.vercel.app/api/umat'),
        axios.get('https://finalbackend-ochre.vercel.app/api/kegiatan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/pengumuman'),
        axios.get('https://finalbackend-ochre.vercel.app/api/galeri'),
        axios.get('https://finalbackend-ochre.vercel.app/api/pendaftaran'),
        axios.get('https://finalbackend-ochre.vercel.app/api/sumbangan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/saran'),
        axios.get('https://finalbackend-ochre.vercel.app/api/merchandise'),
        axios.get('https://finalbackend-ochre.vercel.app/api/absensi'),
        axios.get(`https://finalbackend-ochre.vercel.app/api/jadwal?year=${year}&month=${month}`)
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

      const jadwalData = Array.isArray(jadwalRes.data) ? jadwalRes.data : [];
      setJadwal(jadwalData);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    
    return jadwal.filter(event => {
      const eventDate = new Date(event.tanggal);
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();
      
      return eventYear === dateYear && eventMonth === dateMonth && eventDay === dateDay;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentDate = new Date();
  const calendarDays = getDaysInMonth(currentDate);

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
        
        {/* Calendar Preview Card */}
        <div
          className="content-card"
          style={{
            borderLeft: '4px solid #e74c3c',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            gridColumn: 'span 1'
          }}
          onClick={() => navigate('/jadwal')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '4px'
              }}>
                Calendar Preview
              </h3>
              <p style={{
                color: '#999',
                fontSize: '12px',
                margin: 0
              }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#e74c3c15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiCalendar style={{
                fontSize: '24px',
                color: '#e74c3c'
              }} />
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            fontSize: '11px'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontWeight: '600',
                color: '#666',
                padding: '4px 0',
                fontSize: '10px'
              }}>
                {day.substring(0, 1)}
              </div>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ padding: '8px' }} />;
              }
              const events = getEventsForDate(date);
              const today = isToday(date);
              return (
                <div
                  key={index}
                  style={{
                    textAlign: 'center',
                    padding: '6px 2px',
                    borderRadius: '4px',
                    backgroundColor: today ? '#e74c3c15' : 'transparent',
                    border: today ? '1px solid #e74c3c' : '1px solid transparent',
                    position: 'relative',
                    minHeight: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    fontWeight: today ? '700' : '400',
                    color: today ? '#e74c3c' : '#333',
                    marginBottom: events.length > 0 ? '2px' : '0'
                  }}>
                    {date.getDate()}
                  </span>
                  {events.length > 0 && (
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: events[0]?.kategori?.warna || '#e74c3c',
                      marginTop: '2px'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="content-card">
        <ActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
