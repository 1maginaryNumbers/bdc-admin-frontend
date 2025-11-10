import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiTag } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const JadwalManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [jadwal, setJadwal] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
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
    tempat: '',
    kapasitas: ''
  });
  const [kategoriFormData, setKategoriFormData] = useState({
    nama: '',
    warna: '#3b82f6'
  });
  const [selectedItems, setSelectedItems] = useState([]);

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

  const fetchData = useCallback(async () => {
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
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

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
        tanggal: new Date(formData.tanggal).toISOString(),
        kapasitas: formData.kapasitas ? parseInt(formData.kapasitas) : null
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

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === jadwal.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(jadwal.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        await axios.post('https://finalbackend-ochre.vercel.app/api/jadwal/bulk-delete', { ids: selectedItems });
        toast.success(`Successfully deleted ${selectedItems.length} item(s)`);
        setSelectedItems([]);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete items');
      }
    }
  };

  const openModal = (date = null) => {
    setEditingJadwal(null);
    let dateStr = '';
    if (date) {
      // Use local date components to avoid timezone issues
      const localDate = new Date(date);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal: dateStr,
      waktuMulai: '',
      waktuSelesai: '',
      kategori: '',
      tempat: '',
      kapasitas: ''
    });
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
      tempat: jadwal.tempat || '',
      kapasitas: jadwal.kapasitas || ''
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
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal: '',
      waktuMulai: '',
      waktuSelesai: '',
      kategori: '',
      tempat: '',
      kapasitas: ''
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
    setSelectedItems([]); // Clear selections when month changes
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
    // Compare dates using local date components to avoid timezone issues
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
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0 }}>Calendar</h3>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: '10px',
            width: window.innerWidth <= 768 ? '100%' : 'auto'
          }}>
            <button 
              className="btn btn-success" 
              onClick={() => openKategoriModal()}
              style={{
                width: window.innerWidth <= 768 ? '100%' : 'auto',
                padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
              }}
            >
              <FiTag /> Manage Categories
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => openModal()}
              style={{
                width: window.innerWidth <= 768 ? '100%' : 'auto',
                padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
              }}
            >
              <FiPlus /> Add Event
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigateMonth(-1)}
              style={{
                padding: window.innerWidth <= 768 ? '10px 12px' : '8px 16px',
                fontSize: window.innerWidth <= 768 ? '14px' : '14px'
              }}
            >
              ← Previous
            </button>
            <div style={{ 
              textAlign: 'center', 
              flex: 1,
              minWidth: window.innerWidth <= 768 ? '100%' : 'auto',
              order: window.innerWidth <= 768 ? -1 : 0
            }}>
              <h2 style={{ 
                margin: 0,
                fontSize: window.innerWidth <= 768 ? '18px' : '24px'
              }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigateMonth(1)}
              style={{
                padding: window.innerWidth <= 768 ? '10px 12px' : '8px 16px',
                fontSize: window.innerWidth <= 768 ? '14px' : '14px'
              }}
            >
              Next →
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px', 
          backgroundColor: '#ddd', 
          border: '1px solid #ddd',
          overflowX: window.innerWidth <= 768 ? 'auto' : 'visible'
        }}>
          {dayNames.map(day => (
            <div 
              key={day} 
              style={{ 
                backgroundColor: '#f8f9fa', 
                padding: window.innerWidth <= 768 ? '6px 4px' : '10px', 
                textAlign: 'center', 
                fontWeight: 'bold',
                fontSize: window.innerWidth <= 768 ? '11px' : '14px'
              }}
            >
              {window.innerWidth <= 768 ? day.substring(0, 1) : day}
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
                  minHeight: window.innerWidth <= 768 ? '60px' : '100px',
                  padding: window.innerWidth <= 768 ? '4px 2px' : '8px',
                  cursor: date ? 'pointer' : 'default',
                  border: isToday(date) ? '2px solid #007bff' : '1px solid #eee',
                  position: 'relative',
                  fontSize: window.innerWidth <= 768 ? '11px' : '14px'
                }}
              >
                {date && (
                  <>
                    <div style={{ 
                      fontWeight: isToday(date) ? 'bold' : 'normal', 
                      marginBottom: window.innerWidth <= 768 ? '2px' : '4px',
                      fontSize: window.innerWidth <= 768 ? '12px' : '14px'
                    }}>
                      {date.getDate()}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: window.innerWidth <= 768 ? '1px' : '2px'
                    }}>
                      {events.slice(0, window.innerWidth <= 768 ? 2 : 3).map((event, idx) => (
                        <div
                          key={event._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                          style={{
                            backgroundColor: event.kategori?.warna || '#3b82f6',
                            color: 'white',
                            padding: window.innerWidth <= 768 ? '1px 2px' : '2px 4px',
                            borderRadius: '3px',
                            fontSize: window.innerWidth <= 768 ? '9px' : '11px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={event.judul}
                        >
                          {window.innerWidth <= 768 
                            ? (event.waktuMulai ? `${event.waktuMulai.substring(0, 5)} ` : '') + event.judul.substring(0, 8) + (event.judul.length > 8 ? '...' : '')
                            : (event.waktuMulai ? `${event.waktuMulai} - ` : '') + event.judul
                          }
                        </div>
                      ))}
                      {events.length > (window.innerWidth <= 768 ? 2 : 3) && (
                        <div style={{ 
                          fontSize: window.innerWidth <= 768 ? '8px' : '10px', 
                          color: '#666', 
                          padding: '2px' 
                        }}>
                          +{events.length - (window.innerWidth <= 768 ? 2 : 3)} more
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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Events for {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          {selectedItems.length > 0 && (
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <FiTrash2 /> Delete Selected ({selectedItems.length})
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === jadwal.length && jadwal.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </td>
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
        <div className="modal" style={{
          padding: window.innerWidth <= 768 ? '5px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}>
          <div 
            className="modal-content" 
            ref={modalRef}
            style={{
              width: window.innerWidth <= 768 ? '100%' : '600px',
              maxWidth: window.innerWidth <= 768 ? '100%' : '600px',
              maxHeight: window.innerWidth <= 768 ? '95vh' : '90vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              margin: 'auto',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingJadwal ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
              <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  className="form-control"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                <label className="form-label">Description</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Category</label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box' }}
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

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    name="waktuMulai"
                    value={formData.waktuMulai}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    name="waktuSelesai"
                    value={formData.waktuSelesai}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="tempat"
                    value={formData.tempat}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    name="kapasitas"
                    value={formData.kapasitas}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: '10px'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
                  }}
                >
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

