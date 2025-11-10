import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../contexts/RefreshContext';
import ActivityLog from './ActivityLog';
import {
  FiCalendar
} from 'react-icons/fi';

const Dashboard = () => {
  const { refreshTrigger } = useRefresh();
  const navigate = useNavigate();
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchJadwal();
  }, [refreshTrigger]);

  const fetchJadwal = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const jadwalRes = await axios.get(`https://finalbackend-ochre.vercel.app/api/jadwal?year=${year}&month=${month}`);

      const jadwalData = Array.isArray(jadwalRes.data) ? jadwalRes.data : [];
      setJadwal(jadwalData);
    } catch (error) {
      toast.error('Failed to fetch calendar data');
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
        {/* Calendar Preview Card */}
        <div
          className="content-card"
          style={{
            borderLeft: '4px solid #e74c3c',
            transition: 'all 0.3s ease',
            gridColumn: 'span 1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#212529',
                marginBottom: '6px',
                letterSpacing: '-0.3px'
              }}>
                Calendar Preview
              </h3>
              <p style={{
                color: '#6c757d',
                fontSize: '13px',
                margin: 0,
                fontWeight: '500'
              }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
            </div>
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(231, 76, 60, 0.25)',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/jadwal')}
            >
              <FiCalendar style={{
                fontSize: '26px',
                color: '#fff'
              }} />
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontWeight: '600',
                color: '#6c757d',
                padding: '8px 4px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {day}
              </div>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ 
                  padding: '8px',
                  minHeight: '40px'
                }} />;
              }
              const events = getEventsForDate(date);
              const today = isToday(date);
              const isSelected = selectedDate && date && 
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getDate() === date.getDate();
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(date);
                  }}
                  style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#e3f2fd' : (today ? '#fff' : 'transparent'),
                    border: isSelected ? '2px solid #2196f3' : (today ? '2px solid #e74c3c' : '1px solid transparent'),
                    boxShadow: isSelected ? '0 2px 8px rgba(33, 150, 243, 0.2)' : (today ? '0 2px 8px rgba(231, 76, 60, 0.15)' : 'none'),
                    position: 'relative',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                      : (today 
                        ? 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)' 
                        : 'transparent')
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !today) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !today) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : (today ? '700' : '500'),
                    color: isSelected ? '#2196f3' : (today ? '#e74c3c' : '#495057'),
                    marginBottom: events.length > 0 ? '4px' : '0',
                    lineHeight: '1.2'
                  }}>
                    {date.getDate()}
                  </span>
                  {events.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '3px',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      maxWidth: '100%'
                    }}>
                      {events.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: event?.kategori?.warna || '#e74c3c',
                            boxShadow: `0 1px 3px ${event?.kategori?.warna || '#e74c3c'}40`
                          }}
                        />
                      ))}
                      {events.length > 3 && (
                        <span style={{
                          fontSize: '9px',
                          color: '#6c757d',
                          fontWeight: '600'
                        }}>
                          +{events.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedDate && getEventsForDate(selectedDate).length > 0 && (
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e9ecef'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#212529',
                marginBottom: '12px'
              }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event._id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                      borderLeft: `4px solid ${event.kategori?.warna || '#e74c3c'}`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    onClick={() => navigate('/jadwal')}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#212529',
                        margin: 0
                      }}>
                        {event.judul}
                      </h5>
                      {event.kategori && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: `${event.kategori.warna}20`,
                          color: event.kategori.warna,
                          fontWeight: '600'
                        }}>
                          {event.kategori.nama}
                        </span>
                      )}
                    </div>
                    {(event.waktuMulai || event.waktuSelesai || event.tempat) && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontSize: '12px',
                        color: '#6c757d'
                      }}>
                        {event.waktuMulai && event.waktuSelesai && (
                          <span>🕐 {event.waktuMulai} - {event.waktuSelesai}</span>
                        )}
                        {event.tempat && (
                          <span>📍 {event.tempat}</span>
                        )}
                        {event.kapasitas && (
                          <span>👥 Capacity: {event.kapasitas}</span>
                        )}
                      </div>
                    )}
                    {event.deskripsi && (
                      <p style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        margin: '8px 0 0 0',
                        lineHeight: '1.4'
                      }}>
                        {event.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedDate && getEventsForDate(selectedDate).length === 0 && (
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e9ecef',
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              No events scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      <div className="content-card">
        <ActivityLog />
      </div>
    </div>
  );
};

export default Dashboard;
