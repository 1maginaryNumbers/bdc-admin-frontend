import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiCalendar, FiTag } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const JadwalManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [jadwal, setJadwal] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState(null);
  const [editingKategori, setEditingKategori] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal: '',
    waktuMulai: '',
    waktuSelesai: '',
    kategori: '',
    tempat: ''
  });
  const [kategoriFormData, setKategoriFormData] = useState({
    nama: '',
    warna: '#3b82f6'
  });

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, currentDate]);

  useEscapeKey(() => {
    if (showModal) closeModal();
    if (showKategoriModal) closeKategoriModal();
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) closeModal();
  });

  const kategoriModalRef = useOutsideClick(() => {
    if (showKategoriModal) closeKategoriModal();
  });

  const fetchData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const [jadwalRes, kategoriRes] = await Promise.all([
        axios.get(`https://finalbackend-ochre.vercel.app/api/jadwal?year=${year}&month=${month}`),
        axios.get('https://finalbackend-ochre.vercel.app/api/kategori-jadwal')
      ]);
      setJadwal(jadwalRes.data);
      setKategori(kategoriRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      setJadwal([]);
      setKategori([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKategoriChange = (e) => {
    setKategoriFormData({
      ...kategoriFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        tanggal: new Date(formData.tanggal).toISOString()
      };

      if (editingJadwal) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/jadwal/${editingJadwal._id}`, dataToSend);
        toast.success('Jadwal updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/jadwal', dataToSend);
        toast.success('Jadwal created successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('Failed to save jadwal');
    }
  };

  const handleKategoriSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingKategori) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/kategori-jadwal/${editingKategori._id}`, kategoriFormData);
        toast.success('Kategori updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/kategori-jadwal', kategoriFormData);
        toast.success('Kategori created successfully');
      }
      closeKategoriModal();
      fetchData();
    } catch (error) {
      toast.error('Failed to save kategori');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this jadwal?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/jadwal/${id}`);
        toast.success('Jadwal deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete jadwal');
      }
    }
  };

  const handleDeleteKategori = async (id) => {
    if (window.confirm('Are you sure you want to delete this kategori?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/kategori-jadwal/${id}`);
        toast.success('Kategori deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete kategori');
      }
    }
  };

  const openModal = (date = null) => {
    setEditingJadwal(null);
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : '';
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal: dateStr,
      waktuMulai: '',
      waktuSelesai: '',
      kategori: '',
      tempat: ''
    });
    setSelectedDate(date);
    setShowModal(true);
  };

  const openEditModal = (jadwal) => {
    setEditingJadwal(jadwal);
    setFormData({
      judul: jadwal.judul || '',
      deskripsi: jadwal.deskripsi || '',
      tanggal: jadwal.tanggal ? new Date(jadwal.tanggal).toISOString().split('T')[0] : '',
      waktuMulai: jadwal.waktuMulai || '',
      waktuSelesai: jadwal.waktuSelesai || '',
      kategori: jadwal.kategori?._id || jadwal.kategori || '',
      tempat: jadwal.tempat || ''
    });
    setShowModal(true);
  };

  const openKategoriModal = (kat = null) => {
    setEditingKategori(kat);
    setKategoriFormData({
      nama: kat?.nama || '',
      warna: kat?.warna || '#3b82f6'
    });
    setShowKategoriModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJadwal(null);
    setSelectedDate(null);
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal: '',
      waktuMulai: '',
      waktuSelesai: '',
      kategori: '',
      tempat: ''
    });
  };

  const closeKategoriModal = () => {
    setShowKategoriModal(false);
    setEditingKategori(null);
    setKategoriFormData({
      nama: '',
      warna: '#3b82f6'
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
    const dateStr = date.toISOString().split('T')[0];
    return jadwal.filter(event => {
      const eventDate = new Date(event.tanggal).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="loading">Loading schedule...</div>;
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Jadwal Management</h1>
        <p className="page-subtitle">Manage schedule and calendar events</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Calendar</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={() => openKategoriModal()}>
              <FiTag /> Manage Categories
            </button>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <FiPlus /> Add Event
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-secondary" onClick={() => navigateMonth(-1)}>
              ← Previous
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h2 style={{ margin: 0 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button className="btn btn-sm btn-outline-secondary" onClick={goToToday}>
                Today
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => navigateMonth(1)}>
              Next →
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#ddd', border: '1px solid #ddd' }}>
          {dayNames.map(day => (
            <div key={day} style={{ backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const events = getEventsForDate(date);
            return (
              <div
                key={index}
                onClick={() => date && openModal(date)}
                style={{
                  backgroundColor: 'white',
                  minHeight: '100px',
                  padding: '8px',
                  cursor: date ? 'pointer' : 'default',
                  border: isToday(date) ? '2px solid #007bff' : '1px solid #eee',
                  position: 'relative'
                }}
              >
                {date && (
                  <>
                    <div style={{ fontWeight: isToday(date) ? 'bold' : 'normal', marginBottom: '4px' }}>
                      {date.getDate()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {events.slice(0, 3).map((event, idx) => (
                        <div
                          key={event._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                          style={{
                            backgroundColor: event.kategori?.warna || '#3b82f6',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={event.judul}
                        >
                          {event.waktuMulai ? `${event.waktuMulai} - ` : ''}{event.judul}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div style={{ fontSize: '10px', color: '#666', padding: '2px' }}>
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="content-card">
        <h3>Events for {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Time</th>
                <th>Category</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((item) => (
                <tr key={item._id}>
                  <td>{formatDate(item.tanggal)}</td>
                  <td style={{ fontWeight: '500' }}>{item.judul}</td>
                  <td>
                    {item.waktuMulai && item.waktuSelesai
                      ? `${item.waktuMulai} - ${item.waktuSelesai}`
                      : item.waktuMulai || '-'}
                  </td>
                  <td>
                    {item.kategori ? (
                      <span
                        style={{
                          backgroundColor: item.kategori.warna || '#3b82f6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {item.kategori.nama}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{item.tempat || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEditModal(item)}
                        style={{ flexShrink: 0 }}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                        style={{ flexShrink: 0 }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingJadwal ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">No Category</option>
                    {kategori.map((kat) => (
                      <option key={kat._id} value={kat._id}>
                        {kat.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    name="waktuMulai"
                    value={formData.waktuMulai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    name="waktuSelesai"
                    value={formData.waktuSelesai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="tempat"
                  value={formData.tempat}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingJadwal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKategoriModal && (
        <div className="modal">
          <div className="modal-content" ref={kategoriModalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingKategori ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button className="close-btn" onClick={closeKategoriModal}>×</button>
            </div>

            <form onSubmit={handleKategoriSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  name="nama"
                  value={kategoriFormData.nama}
                  onChange={handleKategoriChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    name="warna"
                    value={kategoriFormData.warna}
                    onChange={handleKategoriChange}
                    style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    name="warna"
                    value={kategoriFormData.warna}
                    onChange={handleKategoriChange}
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeKategoriModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingKategori ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-card" style={{ marginTop: '20px' }}>
        <h3>Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {kategori.map((kat) => (
            <div
              key={kat._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: kat.warna || '#3b82f6',
                color: 'white',
                borderRadius: '4px'
              }}
            >
              <span>{kat.nama}</span>
              <button
                className="btn btn-sm"
                onClick={() => openKategoriModal(kat)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '2px 6px' }}
              >
                <FiEdit />
              </button>
              <button
                className="btn btn-sm"
                onClick={() => handleDeleteKategori(kat._id)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '2px 6px' }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JadwalManagement;

